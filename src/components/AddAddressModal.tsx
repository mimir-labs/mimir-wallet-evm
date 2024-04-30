// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import React from 'react';
import { isAddress } from 'viem';

import Button from './Button';
import Input from './Input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (value: string | React.ChangeEvent<HTMLInputElement>) => void;
  address: string;
  setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
}

function AddAddressModal({ isOpen, onClose, onConfirm, name, address, setName, setAddress }: Props) {
  const disabled = !name || !isAddress(address);

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideCloseButton>
      <ModalContent>
        <ModalHeader className='justify-center font-bold text-2xl'>Add New Contact</ModalHeader>
        <Divider />
        <ModalBody className='flex flex-col gap-y-5 py-5'>
          <Input
            label='Name'
            labelPlacement='outside'
            variant='bordered'
            placeholder='Enter name'
            value={name}
            onChange={setName}
          />
          <Input
            label='Address'
            labelPlacement='outside'
            variant='bordered'
            placeholder='Enter ethereum address'
            value={address}
            onChange={setAddress}
          />
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button color='primary' radius='full' fullWidth variant='bordered' onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={disabled} color='primary' radius='full' fullWidth onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddAddressModal);
