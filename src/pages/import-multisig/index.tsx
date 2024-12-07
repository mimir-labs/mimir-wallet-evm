// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Card, CardBody, CardFooter, Divider, Spinner } from '@nextui-org/react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { AddressRow, Alert, Button, Input } from '@mimir-wallet/components';
import { useCurrentChain, useInputAddress } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { service } from '@mimir-wallet/utils';

function ImportMultisig(): React.ReactElement {
  const { switchAddress } = useContext(AddressContext);
  const [chainId] = useCurrentChain();
  const [[address, isValidAddress], onAddressChange] = useInputAddress(undefined);
  const [isLoading, toggleLoading] = useToggle(false);
  const [alert, setAlert] = useState<React.ReactNode>(null);
  const [safeAccount, setSafeAccount] = useState<BaseAccount>();
  const navigate = useNavigate();

  useEffect(() => {
    if (isValidAddress) {
      setAlert(null);
      toggleLoading(true);
      service
        .getAccountFull(chainId, address as Address)
        .then((data) => {
          if (data.type !== 'safe') {
            setAlert(<Alert severity='error' title='Wrong Threshold/Address, please check config.' />);
          } else {
            setSafeAccount(data);
          }
        })
        .catch(() => {
          setAlert(<Alert severity='error' title='No multisig found, please check multisig address.' />);
        })
        .finally(() => {
          toggleLoading(false);
        });
    }
  }, [address, chainId, isValidAddress, toggleLoading]);

  return (
    <Card className='max-w-md mx-auto p-5'>
      <CardBody className='space-y-4'>
        <h3 className='text-xl font-bold'>Import Multisig</h3>
        <Divider />
        {safeAccount && (
          <>
            <div>
              <Input
                disabled
                label='Name'
                type='text'
                placeholder={safeAccount.name?.toString()}
                value={safeAccount.name?.toString()}
                variant='bordered'
                labelPlacement='outside'
              />
            </div>
            <div className='flex flex-1 flex-col gap-1'>
              <div className='font-bold'>Multisig Wallet Members</div>
              <Card className='mt-1 border-default-300 border-1 min-h-20 flex-1'>
                <CardBody className='space-y-2.5 p-2'>
                  {safeAccount.members?.map((item) => (
                    <div
                      key={item.address}
                      className='flex items-center gap-1 justify-between rounded-small p-1.5 bg-secondary text-tiny snap-start'
                    >
                      <AddressRow iconSize={20} address={item.address} showFull />
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
            <div>
              <Input
                disabled
                label='Threshold'
                type='text'
                placeholder={safeAccount.threshold?.toString()}
                value={safeAccount.threshold?.toString()}
                variant='bordered'
                labelPlacement='outside'
              />
            </div>
          </>
        )}

        <div>
          <Input
            value={address}
            onChange={onAddressChange}
            label='Multisig Address'
            type='text'
            placeholder='0xabcd....'
            variant='bordered'
            labelPlacement='outside'
            endContent={isLoading ? <Spinner size='sm' /> : null}
          />
        </div>

        {alert}

        <div className='flex gap-3'>
          <Button onClick={() => navigate(-1)} fullWidth radius='full' color='primary' variant='bordered'>
            Cancel
          </Button>
          <Button
            disabled={!safeAccount}
            onClick={
              safeAccount
                ? () => {
                    switchAddress(chainId, safeAccount.address, '/');
                  }
                : undefined
            }
            fullWidth
            radius='full'
            color='primary'
          >
            Import
          </Button>
        </div>
      </CardBody>
      <CardFooter className='flex gap-2 items-center justify-center opacity-50'>
        Supported by
        <img width={56} src='/images/safe.webp' alt='safe' />
      </CardFooter>
    </Card>
  );
}

export default ImportMultisig;
