// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Divider, Switch } from '@nextui-org/react';
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncFn, useToggle } from 'react-use';
import { Address, isAddress, parseEther, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { AddressCell, Button, ButtonEnable, FormatBalance, Input } from '@mimir-wallet/components';
import { deployments } from '@mimir-wallet/config';
import { useDelegateAllowance, useInputAddress, useInputNumber, useMultisig, useSafeNonce } from '@mimir-wallet/hooks';
import { AddressContext, SafeContext } from '@mimir-wallet/providers';
import { buildSafeTransaction } from '@mimir-wallet/safe';

function Transfer({ receive }: { receive?: Address }) {
  const navigate = useNavigate();
  const { current } = useContext(AddressContext);
  const { openTxModal } = useContext(SafeContext);
  const { address } = useAccount();
  const [[to], setTo] = useInputAddress(receive);
  const [[amount], setAmount] = useInputNumber();
  const multisig = useMultisig(current);
  const [nonce] = useSafeNonce(multisig?.address);
  const [useSpendLimit, toggleSpendLimit] = useToggle(false);

  const allowance = useDelegateAllowance(current, address);

  const [{ loading: transferLoading }, handleTransfer] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!to || !current || !amount || !isAddress(to) || !allowance || !address) {
        return;
      }

      // const signature = await wallet.signTypedData({
      //   account: address,
      //   domain: {
      //     chainId: wallet.chain.id,
      //     verifyingContract: deployments[wallet.chain.id].modules.Allowance
      //   } as const,
      //   types: TypedDataTypes.allowanceTransfer,
      //   primaryType: 'AllowanceTransfer',
      //   message: {
      //     safe: current,
      //     token: zeroAddress,
      //     to,
      //     amount: parseEther(amount),
      //     paymentToken: zeroAddress,
      //     payment: 0n,
      //     nonce: Number(allowance[4])
      //   }
      // });

      const { request } = await client.simulateContract({
        account: address,
        address: deployments[wallet.chain.id].modules.Allowance,
        abi: abis.Allowance,
        functionName: 'executeAllowanceTransfer',
        args: [current, zeroAddress, to, parseEther(amount), zeroAddress, 0n, address, '0x']
      });

      await wallet.writeContract(request);
    },
    [address, allowance, amount, current, to]
  );

  const handleClick = useCallback(async () => {
    if (!to || !current || !amount || nonce === undefined || !multisig || !isAddress(to)) {
      return;
    }

    const tx = buildSafeTransaction(to, nonce, { value: parseEther(amount) });

    openTxModal(
      {
        website: 'mimir://app/transfer',
        isApprove: false,
        address: multisig.address,
        safeTx: tx
      },
      () => navigate('/transactions')
    );
  }, [amount, current, nonce, multisig, navigate, openTxModal, to]);

  return (
    <div className='max-w-md mx-auto p-5 bg-white rounded-medium space-y-4'>
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
            type='number'
            labelPlacement='outside'
            label='Amount'
            variant='bordered'
            onChange={setAmount}
            placeholder='Enter amount'
            value={amount}
          />
        </div>
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
        <div className='flex gap-3'>
          <Button color='primary' variant='bordered' onClick={() => navigate(-1)} fullWidth radius='full'>
            Cancel
          </Button>
          {allowance && allowance[0] - allowance[1] > 0n && useSpendLimit ? (
            <ButtonEnable
              isToastError
              isLoading={transferLoading}
              onClick={handleTransfer}
              fullWidth
              radius='full'
              color='primary'
            >
              Submit
            </ButtonEnable>
          ) : (
            <ButtonEnable onClick={handleClick} fullWidth radius='full' color='primary'>
              Submit
            </ButtonEnable>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transfer;
