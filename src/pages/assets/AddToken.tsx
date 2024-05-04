// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
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
  const detected = useAccountBalance(current, isAddress(address) ? address : undefined);

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
          <div>
            <b>Detected</b>
          </div>
          {isAddress(address) ? (
            detected ? (
              <div
                className='cursor-pointer flex items-center justify-between gap-2.5'
                onClick={() => {
                  addCustomToken({
                    chainId,
                    name: detected.name,
                    symbol: detected.symbol,
                    decimals: detected.decimals,
                    address: address as `0x${string}`
                  });
                  setAddress('');
                  onClose();
                }}
              >
                <AddressIcon size={40} isToken address={address} />
                <div className='flex-1 flex flex-col gap-y-1'>
                  <div className='inline font-bold text-sm'>{detected.symbol}</div>
                  <div className='inline-flex items-center gap-1 text-tiny font-normal text-foreground/50'>
                    <Address address={address} showFull />
                  </div>
                </div>
                <b>
                  <FormatBalance {...detected} />
                </b>
              </div>
            ) : (
              <Empty label='No results found. Please check if the address is correct.' height={200} />
            )
          ) : null}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default AddToken;
