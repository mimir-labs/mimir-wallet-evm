// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { Card, CardBody } from '@nextui-org/react';
import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddressTransfer, Alert, Button, ButtonLinearBorder, Input, SafeTxButton } from '@mimir-wallet/components';
import { useGroupAccounts, useInputAddress, useInputNumber } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildChangeMember } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

function SetupMember({ multisig }: { multisig?: Multisig }) {
  const { addresses, addAddressBook } = useContext(AddressContext);
  const [selected, setSelected] = useState<Address[]>(multisig?.members || []);
  const [[address, isValidAddress], onAddressChange] = useInputAddress(undefined);
  const [[threshold], setThreshold] = useInputNumber(multisig?.threshold.toString(), true, 1);
  const navigate = useNavigate();
  const { currentChainAll } = useGroupAccounts();

  const isValid = selected.length > 0 && Number(threshold) > 0;

  const reset = () => {
    if (multisig) {
      setSelected(multisig.members);
      setThreshold(multisig.threshold.toString());
    }
  };

  const allAddresses = useMemo(
    () => currentChainAll.filter((item) => !addressEq(item, multisig?.address)),
    [currentChainAll, multisig?.address]
  );

  return (
    <div>
      <h6 className='font-bold mb-1 text-medium text-foreground/50'>Members</h6>

      <Card>
        <CardBody className='p-5 space-y-5'>
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
          <AddressTransfer onChange={setSelected} selected={selected} addresses={allAddresses} />
          <div>
            <Input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              label='Threshold'
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
                <li>A transaction needs to be initiated to execute.</li>
                <li>
                  The change can only be successfully made after it is approved by the required number of members
                  meeting the threshold.
                </li>
              </ul>
            }
          />
          <div className='flex gap-3'>
            <ButtonLinearBorder onClick={reset} fullWidth radius='full'>
              Reset
            </ButtonLinearBorder>
            <SafeTxButton
              metadata={{ website: 'mimir://internal/setup' }}
              isApprove={false}
              isCancel={false}
              address={multisig?.address}
              buildTx={
                multisig?.address
                  ? (_, client) => buildChangeMember(client, multisig.address, selected, threshold)
                  : undefined
              }
              onSuccess={() => navigate('/transactions')}
              isToastError
              disabled={!isValid}
              fullWidth
              radius='full'
              color='primary'
            >
              Save
            </SafeTxButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(SetupMember);
