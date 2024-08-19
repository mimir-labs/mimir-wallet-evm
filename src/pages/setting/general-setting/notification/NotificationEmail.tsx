// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Switch } from '@nextui-org/react';
import React, { useContext, useEffect } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { useChainId } from 'wagmi';

import { Button, Input } from '@mimir-wallet/components';
import { useDeviceUuid, useInput, useNotifications } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { service } from '@mimir-wallet/utils';

function NotificationEmail() {
  const chainId = useChainId();
  const deviceUuid = useDeviceUuid();
  const { current } = useContext(AddressContext);
  const [, emails, isFetched] = useNotifications(deviceUuid);
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

      const isApprovedEnable = emails?.find((item) => item.topic === `${chainId}.${current}` && item.approved);
      const isCreatedEnable = emails?.find((item) => item.topic === `${chainId}.${current}` && item.created);
      const isExecutedEnable = emails?.find((item) => item.topic === `${chainId}.${current}` && item.executed);

      toggleApprovedEnable(isApprovedEnable);
      toggleCreatedEnable(isCreatedEnable);
      toggleExecutedEnable(isExecutedEnable);
    }
  }, [
    chainId,
    current,
    emails,
    isFetched,
    setEmail,
    toggleApprovedEnable,
    toggleCreatedEnable,
    toggleEnable,
    toggleExecutedEnable
  ]);

  const [state, handleEnable] = useAsyncFn(
    async (email: string) => {
      if (!current) {
        return;
      }

      service.subscribeEmail(
        deviceUuid,
        chainId,
        current,
        email,
        isCreatedEnabled,
        isApprovedEnabled,
        isExecutedEnabled
      );
    },
    [chainId, current, deviceUuid, isApprovedEnabled, isCreatedEnabled, isExecutedEnabled]
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
            disabled={!email}
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
          <Switch disabled={!email} isSelected={isEnabled && isCreatedEnabled} onValueChange={toggleCreatedEnable} />
        </div>
        <div className='flex items-center justify-between'>
          Transaction Executed
          <Switch disabled={!email} isSelected={isEnabled && isExecutedEnabled} onValueChange={toggleExecutedEnable} />
        </div>
        <div className='flex items-center justify-between'>
          New Approvement
          <Switch
            disabled={!email}
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
