// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomToken } from './types';

import { useCallback, useState } from 'react';
import store from 'store';

import { CUSTOM_TOKENS_KEY } from '@mimir-wallet/constants';
import { addressEq } from '@mimir-wallet/utils';

export function useCustomTokens() {
  const [customTokens, setCustomTokens] = useState<CustomToken[]>(store.get(CUSTOM_TOKENS_KEY) || []);

  const addCustomToken = useCallback(
    (token: CustomToken) => {
      setCustomTokens((values) => {
        if (values.findIndex((item) => addressEq(item.address, token.address)) > -1) {
          return values;
        }

        const newVal = [...values, token];

        store.set(CUSTOM_TOKENS_KEY, newVal);

        return newVal;
      });
    },
    [setCustomTokens]
  );

  return { customTokens: customTokens || [], addCustomToken };
}
