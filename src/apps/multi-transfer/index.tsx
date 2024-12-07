// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IWalletClient } from '@mimir-wallet/safe/types';

import { Divider } from '@nextui-org/react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Address, encodeFunctionData, erc20Abi, parseUnits, zeroAddress } from 'viem';

import IconAdd from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import IconTransfer from '@mimir-wallet/assets/svg/icon-transfer.svg?react';
import { AddressCell, Button, Input, InputAddress, InputToken, SafeTxButton } from '@mimir-wallet/components';
import { useAccountBalance, useAccountTokens, useMediaQuery } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildMultiSendSafeTx, buildSafeTransaction } from '@mimir-wallet/safe';
import { isValidNumber } from '@mimir-wallet/utils';

import { parseCsv } from './parse';
import Upload from './Upload';

function MultiTransfer({ token: propsToken, callbackPath }: { token?: Address; callbackPath?: string }) {
  const navigate = useNavigate();
  const { current } = useContext(AddressContext);
  const [data, setData] = useState<[string, string][]>([]);
  const [tokens] = useAccountTokens(current);
  const [token, setToken] = useState<Address>(propsToken || zeroAddress);
  const [balance, , isFetchingBalance] = useAccountBalance(current, token);
  const upSm = useMediaQuery('sm');

  const totalAmountBN = useMemo(
    () =>
      balance
        ? data.reduce<bigint>(
            (acc, [, amount]) => acc + parseUnits(isValidNumber(amount) ? amount : '0', balance.decimals),
            0n
          )
        : 0n,
    [balance, data]
  );

  const isInsufficientBalance = balance && totalAmountBN ? totalAmountBN > balance.value : false;

  const buildTx = useCallback(
    async (wallet: IWalletClient) => {
      if (!balance) return;

      const txs = data.map(([to, amount]) =>
        token === zeroAddress
          ? buildSafeTransaction(to as Address, { value: parseUnits(amount, balance.decimals) })
          : buildSafeTransaction(token, {
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [to as Address, parseUnits(amount, balance.decimals)]
              })
            })
      );

      return buildMultiSendSafeTx(wallet.chain, txs);
    },
    [balance, data, token]
  );

  return (
    <div className='max-w-lg mx-auto sm:space-y-5 space-y-4 sm:p-5 p-4'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        {'<'} Back
      </Button>
      <div className='sm:p-5 p-4 bg-white rounded-medium sm:space-y-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-bold'>Multi-Transfer</h3>
          <Button
            as={Link}
            to={`/apps/${encodeURIComponent('mimir://app/transfer')}`}
            color='primary'
            variant='light'
            startContent={<IconTransfer />}
          >
            Solo-Transfer
          </Button>
        </div>
        <Divider />
        <div className='sm:space-y-5 space-y-4'>
          <div>
            <div className='font-bold mb-1'>Sending From</div>
            <div className='rounded-medium bg-secondary p-2.5'>
              <AddressCell address={current} showFull={upSm} withCopy iconSize={30} />
            </div>
          </div>
          <Upload
            accept='.csv'
            onUpload={(file) => {
              parseCsv(file[0], setData, console.error);
            }}
          />
          <InputToken
            account={current}
            showBalance
            tokens={tokens.assets}
            label='Token'
            value={token}
            onChange={setToken}
          />
          <Divider />

          <div className='space-y-2.5'>
            <div className='flex gap-x-2.5'>
              <div className='w-[60%] font-bold flex items-center justify-between'>
                Address
                <Button
                  size='sm'
                  isIconOnly
                  color='primary'
                  radius='full'
                  variant='light'
                  onClick={() => setData((data) => [...data, ['', '']])}
                >
                  <IconAdd />
                </Button>
              </div>
              <div className='font-bold flex items-center'>Amount</div>
            </div>
            {data.map((item, index) => (
              <div
                key={`${index}.${item[0]}`}
                className='flex items-center gap-x-2.5 [&_.InputAddressContent]:min-h-1 [&_.InputAddressContent]:h-[40px]'
              >
                <InputAddress
                  isRow
                  hideAddAddressBook
                  iconSize={20}
                  className='!w-[60%] flex-grow-0 flex-shrink-0'
                  defaultValue={item[0] as Address}
                  onChange={(value) =>
                    value !== item[0] && setData(data.map((item, i) => (i === index ? [value, item[1]] : item)))
                  }
                />

                <Input
                  defaultValue={item[1]}
                  onChange={(e) =>
                    e.target.value !== item[1] &&
                    setData(data.map((item, i) => (i === index ? [item[0], e.target.value] : item)))
                  }
                  variant='bordered'
                />

                <Button
                  variant='light'
                  color='danger'
                  size='sm'
                  isIconOnly
                  onClick={() => setData(data.filter((_, i) => i !== index))}
                >
                  <IconDelete />
                </Button>
              </div>
            ))}
          </div>

          <SafeTxButton
            isApprove={false}
            isCancel={false}
            isToastError
            address={current}
            metadata={{ website: 'mimir://app/multi-transfer' }}
            buildTx={buildTx}
            onSuccess={() => navigate(callbackPath ? decodeURIComponent(callbackPath) : '/transactions')}
            disabled={!current || !balance || isFetchingBalance || isInsufficientBalance}
            fullWidth
            radius='full'
            color={isInsufficientBalance ? 'danger' : 'primary'}
            withConnect
          >
            {isInsufficientBalance ? `Insufficient ${balance?.symbol || ''} balance` : 'Submit'}
          </SafeTxButton>
        </div>
      </div>
    </div>
  );
}

export default MultiTransfer;
