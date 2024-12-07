// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { supportedChains } from '@mimir-wallet/config';

import { useCurrentChain } from './useCurrentChain';

export function useChain(chainId?: number) {
  const [, chain] = useCurrentChain();

  return useMemo(() => (chainId ? supportedChains.find(({ id }) => id === chainId) : chain), [chain, chainId]);
}
