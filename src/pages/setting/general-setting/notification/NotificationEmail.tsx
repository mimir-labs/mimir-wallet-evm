// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Switch } from '@nextui-org/react';
import React, { useContext, useEffect } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { useAccount, useChainId, useWalletClient } from 'wagmi';

import { Button, Input } from '@mimir-wallet/components';
import { useInput, useNotifications } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { service } from '@mimir-wallet/utils';

function NotificationEmail() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: wallet } = useWalletClient();
  const { multisigs } = useContext(AddressContext);
  const [, emails, isFetched] = useNotifications(address);
  const [email, setEmail] = useInput('');
  const [isEnabled, toggleEnable] = useToggle(false);
  const [isApprovedEnabled, toggleApprovedEnable] = useToggle(false);
  const [isCreatedEnabled, toggleCreatedEnable] = useToggle(false);
  const [isExecutedEnabled, toggleExecutedEnable] = useToggle(false);

  useEffect(() => {
    if (isFetched) {
      if (emails && emails.length) {
        toggleEnable(true);
        setEmail(emails[0].email);
      }

      const isApprovedEnable =
        multisigs.length > 0 && emails && emails.length
          ? emails.reduce((result, item) => result && item.approved, true)
          : false;

      const isCreatedEnable =
        multisigs.length > 0 && emails && emails.length
          ? emails.reduce((result, item) => result && item.created, true)
          : false;

      const isExecutedEnable =
        multisigs.length > 0 && emails && emails.length
          ? emails.reduce((result, item) => result && item.executed, true)
          : false;

      toggleApprovedEnable(isApprovedEnable);
      toggleCreatedEnable(isCreatedEnable);
      toggleExecutedEnable(isExecutedEnable);
    }
  }, [
    chainId,
    emails,
    isFetched,
    multisigs,
    setEmail,
    toggleApprovedEnable,
    toggleCreatedEnable,
    toggleEnable,
    toggleExecutedEnable
  ]);

  const [state, handleEnable] = useAsyncFn(
    async (email: string) => {
      if (!wallet) {
        return;
      }

      const signature = await wallet.signMessage({ message: email });

      service.subscribeEmail(signature, email, isCreatedEnabled, isApprovedEnabled, isExecutedEnabled);
    },
    [isApprovedEnabled, isCreatedEnabled, isExecutedEnabled, wallet]
  );

  return (
    <Card>
      <CardBody className='p-5 space-y-2.5'>
        <div className='flex items-center justify-between'>
          <b>Email</b>
          <Switch
            isSelected={isEnabled}
            onValueChange={(state) => {
              toggleEnable(state);
              toggleApprovedEnable(state);
              toggleCreatedEnable(state);
              toggleExecutedEnable(state);
            }}
            disabled={multisigs.length === 0 || !email}
          />
        </div>
        <Input variant='bordered' placeholder='Please input your email' value={email} onChange={setEmail} />
        <p className='text-tiny text-foreground/50'>
          You will receive email notification once your account got new transaction information.
        </p>
        <p>
          <b>Email me once</b>
        </p>
        <div className='flex items-center justify-between'>
          Transaction Created
          <Switch
            disabled={multisigs.length === 0 || !email}
            isSelected={isEnabled && isCreatedEnabled}
            onValueChange={toggleCreatedEnable}
          />
        </div>
        <div className='flex items-center justify-between'>
          Transaction Executed
          <Switch
            disabled={multisigs.length === 0 || !email}
            isSelected={isEnabled && isExecutedEnabled}
            onValueChange={toggleExecutedEnable}
          />
        </div>
        <div className='flex items-center justify-between'>
          New Approvement
          <Switch
            disabled={multisigs.length === 0 || !email}
            isSelected={isEnabled && isApprovedEnabled}
            onValueChange={(state) => {
              if (state) {
                toggleApprovedEnable(true);
              }
            }}
          />
        </div>
        <Button
          fullWidth
          radius='full'
          color='primary'
          isLoading={state.loading}
          onClick={() => {
            if (email) handleEnable(email);
          }}
        >
          Save
        </Button>
      </CardBody>
    </Card>
  );
}

export default React.memo(NotificationEmail);
