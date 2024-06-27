// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Skeleton } from '@nextui-org/react';
import { useContext } from 'react';
import { isAddress } from 'viem';
import { useChainId } from 'wagmi';

import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import { Address, AddressIcon, Empty, FormatBalance, Input } from '@mimir-wallet/components';
import { useAccountBalance, useInputAddress } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function AddToken({ isOpen, onClose }: Props) {
  const chainId = useChainId();
  const { current, addCustomToken } = useContext(AddressContext);
  const [[address], setAddress] = useInputAddress();
  const [balance, isFetched, isFetching] = useAccountBalance(current, isAddress(address) ? address : undefined);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideCloseButton>
      <ModalContent>
        <ModalHeader>
          <Input
            value={address}
            onChange={setAddress}
            variant='bordered'
            placeholder='Token Address'
            labelPlacement='outside'
            startContent={<IconSearch className='text-foreground opacity-30 w-[20px] h-[20px]' />}
          />
        </ModalHeader>
        <ModalBody>
          {isAddress(address) ? (
            isFetched ? (
              balance ? (
                <div
                  className='cursor-pointer flex items-center justify-between gap-2.5'
                  onClick={() => {
                    addCustomToken({
                      chainId,
                      name: balance.name,
                      symbol: balance.symbol,
                      decimals: balance.decimals,
                      address: address as `0x${string}`
                    });
                    setAddress('');
                    onClose();
                  }}
                >
                  <AddressIcon size={40} isToken address={address} />
                  <div className='flex-1 flex flex-col gap-y-1'>
                    <div className='inline font-bold text-sm'>{balance.symbol}</div>
                    <div className='inline-flex items-center gap-1 text-tiny font-normal text-foreground/50'>
                      <Address address={address} showFull />
                    </div>
                  </div>
                  <b>
                    <FormatBalance {...balance} />
                  </b>
                </div>
              ) : (
                <Empty label='No results found. Please check if the address is correct.' height={200} />
              )
            ) : isFetching ? (
              <div className='w-full flex items-center gap-2.5'>
                <div>
                  <Skeleton className='flex rounded-full w-10 h-10' />
                </div>
                <div className='w-full flex flex-col gap-1'>
                  <Skeleton className='h-3 w-3/5 rounded-lg' />
                  <Skeleton className='h-3 w-4/5 rounded-lg' />
                </div>
              </div>
            ) : null
          ) : (
            <p className='text-center text-foreground-400'>Input token address to search.</p>
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default AddToken;
