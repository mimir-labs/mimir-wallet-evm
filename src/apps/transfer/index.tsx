// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Divider, Switch } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncFn, useToggle } from 'react-use';
import {
  Address,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  isAddress,
  parseEther,
  parseUnits,
  zeroAddress
} from 'viem';
import { useAccount } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import {
  AddressCell,
  Button,
  ButtonEnable,
  FormatBalance,
  Input,
  InputToken,
  SafeTxButton
} from '@mimir-wallet/components';
import { deployments } from '@mimir-wallet/config';
import {
  useAccountBalance,
  useAccountTokens,
  useDelegateAllowance,
  useInputAddress,
  useInputNumber
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
  const balance = useAccountBalance(current, token);

  const allowance = useDelegateAllowance(current, address, token);

  const [{ loading: transferLoading }, handleTransfer] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!to || !current || !amount || !isAddress(to) || !allowance || !address) {
        return;
      }

      const { request } = await client.simulateContract({
        account: address,
        address: deployments[wallet.chain.id].modules.Allowance,
        abi: abis.Allowance,
        functionName: 'executeAllowanceTransfer',
        args: [current, token, to, parseEther(amount), zeroAddress, 0n, address, '0x']
      });

      await wallet.writeContract(request);
    },
    [address, allowance, token, amount, current, to]
  );

  return (
    <div className='max-w-lg mx-auto space-y-5 pt-5'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        Back
      </Button>
      <div className='p-5 bg-white rounded-medium space-y-5'>
        <h3 className='text-xl font-bold'>Transfer</h3>
        <Divider />
        <div className='space-y-4'>
          <div>
            <div className='font-bold mb-1'>Sending From</div>
            <div className='rounded-medium bg-secondary p-2.5'>
              <AddressCell address={current} showFull withCopy iconSize={30} />
            </div>
          </div>
          <div className='flex'>
            <Input
              type='text'
              labelPlacement='outside'
              label='To'
              variant='bordered'
              onChange={setTo}
              placeholder='Enter receiver address'
              value={to}
            />
          </div>
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
          <InputToken account={current} tokens={tokens.assets} label='Token' value={token} onChange={setToken} />
          {allowance && allowance[0] - allowance[1] > 0n && (
            <div className='flex justify-between'>
              <Switch
                isSelected={useSpendLimit}
                onValueChange={toggleSpendLimit}
                size='sm'
                className='flex-row-reverse gap-x-1'
              >
                Use Easy Expense?
              </Switch>
              <span>
                <FormatBalance value={allowance[0] - allowance[1]} prefix={<>Easy Expense Limit:</>} />
              </span>
            </div>
          )}
          {allowance && allowance[0] - allowance[1] > 0n && useSpendLimit ? (
            <ButtonEnable
              isToastError
              isLoading={transferLoading}
              onClick={handleTransfer}
              disabled={!to || !current || !amount || !isAddress(to) || !allowance || !address}
              fullWidth
              radius='full'
              color='primary'
            >
              Submit
            </ButtonEnable>
          ) : (
            <SafeTxButton
              isApprove={false}
              isCancel={false}
              address={current}
              website='mimir://app/transfer'
              buildTx={
                isAddress(to) && balance
                  ? async () =>
                      token === zeroAddress
                        ? buildSafeTransaction(to, { value: parseEther(amount) })
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
              disabled={!to || !current || !balance || !amount || !isAddress(to)}
              fullWidth
              radius='full'
              color='primary'
            >
              Submit
            </SafeTxButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transfer;
