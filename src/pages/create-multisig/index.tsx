// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { EnableClickHandler } from '@mimir-wallet/components/types';

import { Card, CardBody, Divider, Tooltip } from '@nextui-org/react';
import { randomBytes } from 'crypto';
import { useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import { bytesToBigInt } from 'viem';

import IconQuestion from '@mimir-wallet/assets/svg/icon-question.svg?react';
import { AddressTransfer, Alert, Button, ButtonEnable, ButtonLinearBorder, Input } from '@mimir-wallet/components';
import { useInput, useInputAddress, useInputNumber } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import CreateMultisigModal from './CreateMultisigModal';
import { useCreateMultisig } from './useCreateMultisig';

function CreateMultisig(): React.ReactElement {
  const { all, addMultisig } = useContext(AddressContext);
  const [name, setName] = useInput();
  const [selected, setSelected] = useState<Address[]>([]);
  const [[address, isValidAddress], onAddressChange] = useInputAddress(undefined);
  const [[threshold], setThreshold] = useInputNumber('1', true);
  const navigate = useNavigate();
  const [isOpen, toggleOpen] = useToggle(false);
  const saltRef = useRef(bytesToBigInt(randomBytes(32)));
  const [state, start] = useCreateMultisig(selected, BigInt(threshold), name, saltRef.current);
  const retry = useRef<() => void>(() => {});

  const isValid = selected.length > 1 && Number(threshold) > 0;

  const handleCreate = useCallback<EnableClickHandler>(
    (wallet, client) => {
      start(client, wallet);
      retry.current = () => start(client, wallet);
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
                  setSelected((value) => Array.from(new Set([...value, address])) as Address[]);
                  onAddressChange('');
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
                    color='secondary'
                    content='The number of members required to agree in order to execute any transaction.'
                  >
                    <div>
                      <IconQuestion className='text-default-200' />
                    </div>
                  </Tooltip>
                </div>
              }
              type='number'
              step={1}
              min={1}
              placeholder='Threshold'
              variant='bordered'
              labelPlacement='outside'
            />
          </div>
          <Alert
            severity='warning'
            title='Notice'
            content={
              <ul className='list-disc pl-3'>
                <li>Fee is necessary for creation.</li>
                <li>
                  Use a threshold higher than one to prevent losing access to your Multisig Account in case an owner key
                  is lost or compromised.
                </li>
              </ul>
            }
          />
          <div className='flex gap-3'>
            <ButtonLinearBorder onClick={() => navigate(-1)} fullWidth radius='full'>
              Cancel
            </ButtonLinearBorder>
            <ButtonEnable disabled={!isValid} onClick={handleCreate} fullWidth radius='full' color='primary'>
              Create
            </ButtonEnable>
          </div>
        </CardBody>
      </Card>
      <CreateMultisigModal
        onRetry={(wallet, client) => {
          start(client, wallet);
        }}
        state={state}
        isOpen={isOpen}
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
