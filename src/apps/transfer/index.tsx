// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Divider, Switch } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsyncFn, useToggle } from 'react-use';
import { Address, encodeFunctionData, erc20Abi, formatUnits, isAddress, parseUnits, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import IconTransfer from '@mimir-wallet/assets/svg/icon-transfer.svg?react';
import {
  AddressCell,
  Button,
  ButtonEnable,
  FormatBalance,
  Input,
  InputAddress,
  InputToken,
  SafeTxButton
} from '@mimir-wallet/components';
import { moduleDeployments } from '@mimir-wallet/config';
import { useDelegateAllowance } from '@mimir-wallet/features/allowance';
import {
  useAccountBalance,
  useAccountTokens,
  useInputAddress,
  useInputNumber,
  useMediaQuery
} from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildSafeTransaction } from '@mimir-wallet/safe';

function Transfer({
  receive,
  token: propsToken,
  callbackPath
}: {
  token?: Address;
  receive?: Address;
  callbackPath?: string;
}) {
  const navigate = useNavigate();
  const { current } = useContext(AddressContext);
  const { address } = useAccount();
  const [[to], setTo] = useInputAddress(receive);
  const [[amount], setAmount] = useInputNumber(undefined, false, 0);
  const [useSpendLimit, toggleSpendLimit] = useToggle(false);
  const [tokens] = useAccountTokens(current);
  const [token, setToken] = useState<Address>(propsToken || zeroAddress);
  const [balance, , isFetchingBalance] = useAccountBalance(current, token);
  const allowance = useDelegateAllowance(current, address, token);
  const upSm = useMediaQuery('sm');

  const isInsufficientBalance = balance && amount ? parseUnits(amount, balance.decimals) > balance.value : false;
  const isInsufficientAllowance =
    balance && amount && allowance !== undefined
      ? parseUnits(amount, balance.decimals) > allowance[0] - allowance[1]
      : false;

  const [{ loading: transferLoading }, handleTransfer] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!to || !current || !amount || !isAddress(to) || !allowance || !address || !balance) {
        return;
      }

      const { request } = await client.simulateContract({
        account: address,
        address: moduleDeployments[wallet.chain.id].Allowance[0],
        abi: abis.Allowance,
        functionName: 'executeAllowanceTransfer',
        args: [current, token, to, parseUnits(amount, balance.decimals), zeroAddress, 0n, address, '0x']
      });

      await wallet.writeContract(request);

      await navigate(callbackPath ? decodeURIComponent(callbackPath) : '/transactions');
    },
    [to, current, amount, allowance, address, balance, token, navigate, callbackPath]
  );

  return (
    <div className='max-w-lg mx-auto sm:space-y-5 space-y-4 sm:p-5 p-4'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        {'<'} Back
      </Button>
      <div className='sm:p-5 p-4 bg-white rounded-medium sm:space-y-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-bold'>Transfer</h3>
          <Button
            as={Link}
            to={`/apps/${encodeURIComponent('mimir://app/multi-transfer')}`}
            color='primary'
            variant='light'
            startContent={<IconTransfer />}
          >
            Multi-Transfer
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
          <div className='flex'>
            <InputAddress label='To' onChange={setTo} placeholder='Enter receiver address' value={to as Address} />
          </div>
          <InputToken account={current} tokens={tokens.assets} label='Token' value={token} onChange={setToken} />
          <div className='flex'>
            <Input
              labelPlacement='outside'
              classNames={{ label: ['flex', 'items-center', 'justify-between', 'w-full'] }}
              label={
                <>
                  Amount
                  <span className='font-normal'>
                    <FormatBalance prefix='Balance:' {...balance} />
                  </span>
                </>
              }
              variant='bordered'
              endContent={
                <Button
                  color='primary'
                  size='tiny'
                  variant='bordered'
                  onClick={() => balance && setAmount(formatUnits(balance.value, balance.decimals))}
                >
                  Max
                </Button>
              }
              onChange={setAmount}
              placeholder='Enter amount'
              value={amount}
            />
          </div>
          {allowance && allowance[0] - allowance[1] > 0n && (
            <div className='flex items-center justify-between'>
              <Switch
                isSelected={useSpendLimit}
                onValueChange={toggleSpendLimit}
                size='sm'
                className='flex-row-reverse gap-x-1'
                classNames={{ label: 'sm:text-small text-tiny' }}
              >
                Use Easy Expense?
              </Switch>
              <span className='sm:text-small text-tiny'>
                <FormatBalance value={allowance[0] - allowance[1]} prefix={<>Easy Expense Limit:</>} />
              </span>
            </div>
          )}
          {allowance && allowance[0] - allowance[1] > 0n && useSpendLimit ? (
            <ButtonEnable
              isToastError
              isLoading={transferLoading}
              onClick={handleTransfer}
              disabled={
                !to ||
                !current ||
                !amount ||
                !isAddress(to) ||
                !allowance ||
                !address ||
                isFetchingBalance ||
                isInsufficientAllowance ||
                isInsufficientBalance
              }
              fullWidth
              radius='full'
              color={isInsufficientAllowance || isInsufficientAllowance ? 'danger' : 'primary'}
              withConnect
            >
              {isInsufficientBalance
                ? `Insufficient ${balance?.symbol || ''} balance`
                : isInsufficientAllowance
                  ? 'Exceed Limit'
                  : 'Submit'}
            </ButtonEnable>
          ) : (
            <SafeTxButton
              isApprove={false}
              isCancel={false}
              address={current}
              metadata={{ website: 'mimir://app/transfer' }}
              buildTx={
                isAddress(to) && balance
                  ? async () =>
                      token === zeroAddress
                        ? buildSafeTransaction(to, { value: parseUnits(amount, balance.decimals) })
                        : buildSafeTransaction(token, {
                            data: encodeFunctionData({
                              abi: erc20Abi,
                              functionName: 'transfer',
                              args: [to, parseUnits(amount, balance.decimals)]
                            })
                          })
                  : undefined
              }
              onSuccess={() => navigate(callbackPath ? decodeURIComponent(callbackPath) : '/transactions')}
              disabled={
                !to || !current || !balance || !amount || !isAddress(to) || isFetchingBalance || isInsufficientBalance
              }
              fullWidth
              radius='full'
              color={isInsufficientBalance ? 'danger' : 'primary'}
              withConnect
            >
              {isInsufficientBalance ? `Insufficient ${balance?.symbol || ''} balance` : 'Submit'}
            </SafeTxButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transfer;
