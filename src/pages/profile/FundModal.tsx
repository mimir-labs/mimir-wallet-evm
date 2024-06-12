// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useAsyncFn } from 'react-use';
import { formatUnits, parseEther, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { AddressCell, Button, ButtonEnable, FormatBalance, Input } from '@mimir-wallet/components';
import { useAccountBalance, useInputNumber } from '@mimir-wallet/hooks';
import { IWalletClient } from '@mimir-wallet/safe/types';

function FundModal({ safeAddress, isOpen, onClose }: { safeAddress: Address; isOpen: boolean; onClose: () => void }) {
  const { address } = useAccount();
  const [[amount], setAmount] = useInputNumber(undefined, false, 0);
  const [balance, , isFetchingBalance] = useAccountBalance(address, zeroAddress);
  const isInsufficientBalance = balance && amount ? parseEther(amount) > balance.value : false;

  const [{ loading: transferLoading }, handleTransfer] = useAsyncFn(
    async (wallet: IWalletClient) => {
      if (!amount) {
        return;
      }

      await wallet.sendTransaction({
        to: safeAddress,
        value: parseEther(amount)
      });

      onClose();
    },
    [amount, safeAddress, onClose]
  );

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>Fund</ModalHeader>
        <ModalBody>
          <div className='space-y-5'>
            <div>
              <div className='font-bold mb-1'>Sending From</div>
              <div className='rounded-medium bg-secondary p-2.5'>
                <AddressCell address={address} showFull withCopy iconSize={30} />
              </div>
            </div>
            <div>
              <div className='font-bold mb-1'>To</div>
              <div className='rounded-medium bg-secondary p-2.5'>
                <AddressCell address={safeAddress} showFull withCopy iconSize={30} />
              </div>
            </div>
            <div className='flex'>
              <Input
                labelPlacement='outside'
                classNames={{ label: ['flex', 'items-center', 'justify-between', 'w-full'] }}
                label={
                  <>
                    Amount
                    <span className='font-normal'>
                      <FormatBalance prefix='Balance:' {...balance} showSymbol />
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
          </div>
        </ModalBody>
        <ModalFooter>
          <ButtonEnable
            isToastError
            isLoading={transferLoading}
            onClick={handleTransfer}
            disabled={!amount || !address || isFetchingBalance || isInsufficientBalance}
            fullWidth
            radius='full'
            color={isInsufficientBalance ? 'danger' : 'primary'}
            withConnect
          >
            {isInsufficientBalance ? `Insufficient ${balance?.symbol || ''} balance` : 'Submit'}
          </ButtonEnable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FundModal;
