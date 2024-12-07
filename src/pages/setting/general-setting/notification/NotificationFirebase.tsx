// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Switch } from '@nextui-org/react';
import React, { useContext, useEffect } from 'react';
import { useAsyncFn, useToggle } from 'react-use';

import { getRegisterDeviceToken, requestNotificationPermission } from '@mimir-wallet/features/push-notification/setup';
import { useCurrentChain, useDeviceUuid, useNotifications } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { service } from '@mimir-wallet/utils';

function NotificationFirebase() {
  const [chainId] = useCurrentChain();
  const deviceUuid = useDeviceUuid();
  const { current } = useContext(AddressContext);
  const [firebases, , isFetched] = useNotifications(deviceUuid);
  const [isEnabled, toggleEnable] = useToggle(false);

  useEffect(() => {
    if (isFetched) {
      const isEnable = !!firebases?.find((item) => item.topic === `${chainId}.${current}`);

      toggleEnable(isEnable);
    }
  }, [chainId, current, firebases, isFetched, toggleEnable]);

  const [state, handleEnable] = useAsyncFn(async () => {
    if (!current) {
      return;
    }

    const isGrant = await requestNotificationPermission();

    if (!isGrant) {
      return;
    }

    const token = await getRegisterDeviceToken();

    service.subscribeFirebase(deviceUuid, chainId, current, token);

    toggleEnable(true);
  }, [chainId, current, deviceUuid, toggleEnable]);

  const [disableState, handleDisable] = useAsyncFn(async () => {
    if (!current) return;

    await service.unsubscribeFirebase(deviceUuid, chainId, current);

    toggleEnable(false);
  }, [chainId, current, deviceUuid, toggleEnable]);

  return (
    <Card>
      <CardBody className='p-5 space-y-2.5'>
        <div className='flex items-center justify-between'>
          <b>Push Notification</b>
          <Switch
            isSelected={isEnabled}
            onValueChange={(state) => {
              if (state) {
                handleEnable();
              } else {
                handleDisable();
              }
            }}
            disabled={state.loading || disableState.loading}
          />
        </div>
        <p className='text-tiny text-foreground/50'>
          Enable push notifications for this Account in your browser with your signature. You will need to enable them
          again if you clear your browser cache.
        </p>
      </CardBody>
    </Card>
  );
}

export default React.memo(NotificationFirebase);
