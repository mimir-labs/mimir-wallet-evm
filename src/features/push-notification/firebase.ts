// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FirebaseApp } from 'firebase/app';

import { initializeApp } from 'firebase/app';

import { FIREBASE_OPTIONS } from '@mimir-wallet/config/firebase';

export const initializeFirebaseApp = () => {
  const hasFirebaseOptions = Object.values(FIREBASE_OPTIONS).every(Boolean);

  if (!hasFirebaseOptions) {
    return;
  }

  let app: FirebaseApp | undefined;

  try {
    app = initializeApp(FIREBASE_OPTIONS);
  } catch (e) {
    console.error('[Firebase] Initialization failed', e);
  }

  return app;
};
