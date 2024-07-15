// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from '@nextui-org/react';
import { Address } from 'abitype';
import React, { useCallback, useState } from 'react';
import { getAddress } from 'viem';

import IconEdit from '@mimir-wallet/assets/svg/icon-edit.svg?react';
import { Address as AddressComp, AddressIcon, Alert, Button, Input } from '@mimir-wallet/components';
import { useInput, useInputAddress, useQueryAccountWithState } from '@mimir-wallet/hooks';

function SetName({ safeAddress, onDone }: { safeAddress?: Address; onDone: (address: Address, name: string) => void }) {
  const [[address, isValidAddress], setAddress] = useInputAddress(safeAddress);
  const [name, setName] = useInput('');

  return (
    <>
      <ModalBody className='gap-4'>
        <Input
          variant='bordered'
          labelPlacement='outside'
          placeholder='0xabcd...'
          label='Address'
          value={address}
          onChange={setAddress}
        />
        <Input variant='bordered' labelPlacement='outside' label='Name' placeholder='Input name' onChange={setName} />
      </ModalBody>
      <Divider />
      <ModalFooter>
        <Button
          fullWidth
          radius='full'
          color='primary'
          disabled={!isValidAddress}
          onClick={isValidAddress ? () => onDone(getAddress(address), name) : undefined}
        >
          Next
        </Button>
      </ModalFooter>
    </>
  );
}

function SetMembersName({
  safeAddress,
  onDone
}: {
  safeAddress: Address;
  onDone: (address: Address, names: Record<string, string>) => void;
}) {
  const [safeAccount, isFetched, isFetching] = useQueryAccountWithState(safeAddress, false, false);
  const [names, setNames] = useState<Record<string, string>>({});

  if (!isFetched && isFetching) {
    return <Spinner className='m-5' />;
  }

  if (safeAccount?.type !== 'safe') {
    return (
      <div className='p-5'>
        <Alert severity='error' title='Invalid safe account' />
      </div>
    );
  }

  return (
    <>
      <ModalBody className='gap-4'>
        {safeAccount?.members?.map((member, index) => (
          <div
            key={member.address}
            className='flex items-center text-small gap-[5px] p-2.5 rounded-medium border-1 border-[#D9D9D9]'
          >
            <AddressIcon thresholdVisible={false} size={20} address={member.address} />
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                setNames((values) => ({ ...values, [member.address]: e.currentTarget.textContent || '' }))
              }
              className='outline-none'
            >
              Member {index + 1}
            </div>

            <Button
              size='tiny'
              isIconOnly
              variant='light'
              className='text-foreground/50 ml-4'
              onClick={(e) => {
                (e.currentTarget.previousSibling as { focus?: () => void })?.focus?.();
              }}
            >
              <IconEdit />
            </Button>

            <div className='flex-1 text-right'>
              <AddressComp address={member.address} />
            </div>
          </div>
        ))}
        <Input
          variant='bordered'
          labelPlacement='outside'
          label='Threshold'
          placeholder='Input name'
          disabled
          classNames={{
            innerWrapper: 'bg-secondary'
          }}
          value={`${safeAccount?.threshold}/${safeAccount?.members?.length}`}
        />
      </ModalBody>
      <Divider />
      <ModalFooter>
        <Button fullWidth radius='full' color='primary' onClick={() => onDone(safeAddress, names)}>
          Confirm
        </Button>
      </ModalFooter>
    </>
  );
}

function AddWatchOnly({
  safeAddress,
  isOpen,
  onClose,
  onConfirm
}: {
  safeAddress?: Address;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: Address, names: Record<string, string>) => void;
}) {
  const [address, setAddress] = useState<Address>();
  const [name, setName] = useState('');

  const handleClose = useCallback(() => {
    onClose();
    setAddress(undefined);
    setName('');
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{!address ? 'Add New Watch-Only Multisig' : 'Add Name for Each Member'}</ModalHeader>
        <Divider />
        {!address ? (
          <SetName
            safeAddress={safeAddress}
            onDone={(address, name) => {
              setAddress(address);
              setName(name);
            }}
          />
        ) : (
          <SetMembersName
            safeAddress={address}
            onDone={(address, names) => {
              handleClose();
              setAddress(undefined);
              onConfirm(address, { ...names, [address]: name });
            }}
          />
        )}
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddWatchOnly);
