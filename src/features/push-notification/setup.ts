// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getMessaging, getToken } from 'firebase/messaging';

import { FIREBASE_VAPID_KEY } from '@mimir-wallet/config';

import { initializeFirebaseApp } from './firebase';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Notification.permission === 'granted') {
    return true;
  }

  let permission: NotificationPermission | undefined;

  try {
    permission = await Notification.requestPermission();
  } catch (e) {
    console.error(e);
  }

  return permission === 'granted';
};

export async function getRegisterDeviceToken() {
  const [serviceWorkerRegistration] = await navigator.serviceWorker.getRegistrations();

  const app = initializeFirebaseApp();
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration
  });

  return token;
}
