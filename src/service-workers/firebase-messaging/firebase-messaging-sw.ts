// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference lib="webworker" />

import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

import { initializeFirebaseApp } from '@mimir-wallet/features/push-notification/firebase';

declare const self: ServiceWorkerGlobalScope;

const ICON_PATH = '/images/logo-circle.png';

export function firebaseMessagingSw() {
  const app = initializeFirebaseApp();

  if (!app) {
    return;
  }

  // Must be called before `onBackgroundMessage` as Firebase embeds a `notificationclick` listener
  self.addEventListener(
    'notificationclick',
    (event) => {
      event.notification.close();

      const { data } = event.notification;

      self.clients.openWindow(data.link);
    },
    false
  );

  const messaging = getMessaging(app);

  onBackgroundMessage(messaging, async (payload) => {
    const { notification, data } = payload;

    if (notification) {
      self.registration.showNotification(notification.title || 'Alert', {
        icon: ICON_PATH,
        body: notification.body,
        data
      });
    }
  });
}
