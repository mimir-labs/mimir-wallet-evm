// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomToken } from './types';

import { useCallback } from 'react';
import { useChainId } from 'wagmi';

import { CUSTOM_TOKENS_KEY, EmptyArray } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

export function useCustomTokens() {
  const chainId = useChainId();
  const [customTokens, setCustomTokens] = useLocalStore<CustomToken[]>(`${CUSTOM_TOKENS_KEY}:${chainId}`, []);

  const addCustomToken = useCallback(
    (token: CustomToken) => {
      setCustomTokens((values) => {
        if (values.findIndex((item) => addressEq(item.address, token.address)) > -1) {
          return values;
        }

        const newVal = [...values, token];

        return newVal;
      });
    },
    [setCustomTokens]
  );

  return { customTokens: customTokens || EmptyArray, addCustomToken };
}
