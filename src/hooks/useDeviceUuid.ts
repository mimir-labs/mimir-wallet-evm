// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { v7 as uuidv7 } from 'uuid';

import { DEVICE_UUIR_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

export function useDeviceUuid() {
  const uuidRef = useRef((store.get(DEVICE_UUIR_KEY) as string | undefined) || uuidv7());

  useEffect(() => {
    if (store.get(DEVICE_UUIR_KEY) !== uuidRef.current) {
      store.set(DEVICE_UUIR_KEY, uuidRef.current);
    }
  }, []);

  return uuidRef.current;
}
