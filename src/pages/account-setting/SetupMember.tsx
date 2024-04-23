// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { Card, CardBody } from '@nextui-org/react';
import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncFn } from 'react-use';

import {
  AddressTransfer,
  Alert,
  Button,
  ButtonEnable,
  ButtonLinear,
  ButtonLinearBorder,
  Input
} from '@mimir-wallet/components';
import { toastError } from '@mimir-wallet/components/ToastRoot';
import { useInputAddress, useInputNumber } from '@mimir-wallet/hooks';
import { AddressContext, SafeContext } from '@mimir-wallet/providers';
import { buildChangeMember } from '@mimir-wallet/safe';

function SetupMember({ multisig }: { multisig?: Multisig }) {
  const { all } = useContext(AddressContext);
  const { openTxModal } = useContext(SafeContext);
  const [selected, setSelected] = useState<Address[]>(multisig?.members || []);
  const [[address, isValidAddress], onAddressChange] = useInputAddress(undefined);
  const [[threshold], setThreshold] = useInputNumber(multisig?.threshold.toString(), true);
  const navigate = useNavigate();

  const isValid = selected.length > 1 && Number(threshold) > 0;

  const reset = () => {
    if (multisig) {
      setSelected(multisig.members);
      setThreshold(multisig.threshold.toString());
    }
  };

  const [{ loading }, handleClick] = useAsyncFn(
    // eslint-disable-next-line consistent-return
    async (wallet, client) => {
      if (multisig) {
        return buildChangeMember(client, multisig, selected, threshold)
          .then((tx) => {
            openTxModal(
              {
                website: 'mimir://internal/setup',
                isApprove: false,
                address: multisig.address,
                safeTx: tx
              },
              () => navigate('/transactions')
            );
          })
          .catch(toastError);
      }
    },
    [multisig, navigate, openTxModal, selected, threshold]
  );

  const addresses = useMemo(
    () => all.filter((item) => item.toLowerCase() !== multisig?.address.toLowerCase()),
    [all, multisig?.address]
  );

  return (
    <Card>
      <CardBody className='p-5 space-y-4'>
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
        <AddressTransfer onChange={setSelected} selected={selected} addresses={addresses} />
        <div>
          <Input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            label='Threshold'
            type='number'
            step={1}
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
          <ButtonLinearBorder onClick={reset} fullWidth radius='full'>
            Reset
          </ButtonLinearBorder>
          <ButtonEnable
            isLoading={loading}
            onClick={handleClick}
            disabled={!isValid}
            fullWidth
            radius='full'
            Component={ButtonLinear}
          >
            Save
          </ButtonEnable>
        </div>
      </CardBody>
    </Card>
  );
}

export default React.memo(SetupMember);
