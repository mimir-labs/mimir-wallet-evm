// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { EnableClickHandler } from '@mimir-wallet/components/types';

import { Card, CardBody, CardFooter, Divider, Tooltip } from '@nextui-org/react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import IconQuestion from '@mimir-wallet/assets/svg/icon-question.svg?react';
import { AddressTransfer, Alert, Button, ButtonEnable, ButtonLinearBorder, Input } from '@mimir-wallet/components';
import { useInput, useInputAddress, useInputNumber } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

import CreateMultisigModal from './CreateMultisigModal';
import { useCreateMultisig } from './useCreateMultisig';

function CreateMultisig(): React.ReactElement {
  const { all, addMultisig, addresses, addAddressBook, isSigner, isMultisig } = useContext(AddressContext);
  const [name, setName] = useInput();
  const [selected, setSelected] = useState<Address[]>([]);
  const [[address, isValidAddress], onAddressChange] = useInputAddress(undefined);
  const [[threshold], setThreshold] = useInputNumber('1', true, 1);
  const navigate = useNavigate();
  const [isOpen, toggleOpen] = useToggle(false);
  const [state, start, reset] = useCreateMultisig(selected, BigInt(threshold), name);

  const isValid = selected.length > 0 && Number(threshold) > 0;

  const memberHasSigner = useMemo(
    () => selected.findIndex((address) => isSigner(address) || isMultisig(address)) > -1,
    [isMultisig, isSigner, selected]
  );

  const handleCreate = useCallback<EnableClickHandler>(
    (wallet, client) => {
      start(client, wallet);
      toggleOpen(true);
    },
    [start, toggleOpen]
  );

  return (
    <>
      <Card className='max-w-md mx-auto p-5'>
        <CardBody className='space-y-4'>
          <h3 className='text-xl font-bold'>Create Multisig</h3>
          <Divider />
          <div>
            <Input
              value={name}
              onChange={setName}
              label='Name'
              type='text'
              placeholder='Enter multisig name'
              variant='bordered'
              labelPlacement='outside'
            />
          </div>
          <div className='flex items-end gap-2'>
            <Input
              color={isValidAddress || !address ? undefined : 'danger'}
              errorMessage={isValidAddress || !address ? null : 'Please input ethereum address'}
              value={address}
              onChange={onAddressChange}
              label='Add Multisig Wallet Members'
              type='text'
              placeholder='Enter ethereum address'
              variant='bordered'
              labelPlacement='outside'
            />
            <Button
              onClick={() => {
                if (isValidAddress) {
                  const onDone = () => {
                    setSelected((value) => Array.from(new Set([...value, address])) as Address[]);
                    onAddressChange('');
                  };

                  if (!addresses.find((item) => addressEq(item, address))) {
                    addAddressBook([address as Address, '']).then(() => {
                      onDone();
                    });
                  } else {
                    onDone();
                  }
                }
              }}
              className='min-w-14'
              radius='full'
              color='primary'
            >
              Add
            </Button>
          </div>
          <AddressTransfer onChange={setSelected} selected={selected} addresses={all} />
          <div>
            <Input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              label={
                <div className='flex items-center gap-1'>
                  Threshold
                  <Tooltip
                    showArrow
                    color='default'
                    content='The number of members required to agree in order to execute any transaction.'
                    className='p-4'
                  >
                    <div>
                      <IconQuestion className='text-default-200' />
                    </div>
                  </Tooltip>
                </div>
              }
              placeholder='Threshold'
              variant='bordered'
              labelPlacement='outside'
            />
          </div>
          <Alert
            severity='warning'
            title='Notice'
            content={
              <ul className='list-disc'>
                <li>Fee is necessary for creation.</li>
                <li>
                  Use a threshold higher than one to prevent losing access to your Multisig Account in case an owner key
                  is lost or compromised.
                </li>
              </ul>
            }
          />
          {isValid && !memberHasSigner && (
            <Alert severity='warning' title='You are creating multisig for other. It would be a watch-only address.' />
          )}
          <div className='flex gap-3'>
            <ButtonLinearBorder onClick={() => navigate(-1)} fullWidth radius='full'>
              Cancel
            </ButtonLinearBorder>
            <ButtonEnable disabled={!isValid} onClick={handleCreate} fullWidth radius='full' color='primary'>
              Create
            </ButtonEnable>
          </div>
        </CardBody>
        <CardFooter className='flex gap-2 items-center justify-center opacity-50'>
          Supported by
          <img width={56} src='/images/safe.webp' alt='safe' />
        </CardFooter>
      </Card>
      <CreateMultisigModal
        onRetry={(wallet, client) => {
          start(client, wallet);
        }}
        state={state}
        isOpen={isOpen}
        onClose={() => {
          reset();
          toggleOpen(false);
        }}
        onDone={(account) => {
          toggleOpen(false);
          navigate('/');
          addMultisig(account);
        }}
      />
    </>
  );
}

export default CreateMultisig;
