// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Switch } from '@nextui-org/react';
import React, { useContext, useEffect } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { getAddress } from 'viem';
import { useAccount, useChainId, useWalletClient } from 'wagmi';

import { getRegisterDeviceToken, requestNotificationPermission } from '@mimir-wallet/features/push-notification/setup';
import { useNotifications } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { service } from '@mimir-wallet/utils';

function NotificationFirebase() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: wallet } = useWalletClient();
  const { multisigs } = useContext(AddressContext);
  const [firebases, , isFetched] = useNotifications(address);
  const [isEnabled, toggleEnable] = useToggle(false);

  useEffect(() => {
    if (isFetched) {
      const isEnable =
        multisigs.length > 0 && firebases && firebases.length
          ? multisigs.reduce<boolean>((result, item) => {
              result &&= !!firebases.find(({ topic }) => topic === `${chainId}.${getAddress(item.address)}`);

              return result;
            }, true)
          : false;

      toggleEnable(isEnable);
    }
  }, [chainId, firebases, isFetched, multisigs, toggleEnable]);

  const [state, handleEnable] = useAsyncFn(async () => {
    if (!wallet) {
      return;
    }

    const isGrant = await requestNotificationPermission();

    if (!isGrant) {
      return;
    }

    const token = await getRegisterDeviceToken();

    const signature = await wallet.signMessage({ message: token });

    service.subscribeFirebase(signature, token);

    toggleEnable(true);
  }, [toggleEnable, wallet]);

  const [disableState, handleDisable] = useAsyncFn(async () => {
    if (!wallet) {
      return;
    }

    const signature = await wallet.signMessage({ message: 'Unsubscribe notification' });

    await service.unsubscribeFirebase(signature);

    toggleEnable(false);
  }, [toggleEnable, wallet]);

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
            disabled={state.loading || disableState.loading || multisigs.length === 0}
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
