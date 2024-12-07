// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomChain } from '@mimir-wallet/config';

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChainId, useChains } from 'wagmi';

import { CURRENT_CHAINID_KEY } from '@mimir-wallet/constants';

import { useLocalStore } from './useStore';

export function useCurrentChain(): [
  chainId: number,
  chain: CustomChain,
  walletChainId: number,
  walletChain: CustomChain,
  chains: CustomChain[]
] {
  // eslint-disable-next-line no-restricted-syntax
  const walletChainId = useChainId();
  // eslint-disable-next-line no-restricted-syntax
  const chains = useChains();
  const [searchParams] = useSearchParams();
  const [localChainId] = useLocalStore<number>(CURRENT_CHAINID_KEY);
  const urlChainId = searchParams.get('chainid');

  const chainId = Number(urlChainId || localChainId || walletChainId);

  const chain = useMemo(() => chains.find((item) => item.id === chainId) as CustomChain, [chainId, chains]);
  const walletChain = useMemo(
    () => chains.find((item) => item.id === walletChainId) as CustomChain,
    [walletChainId, chains]
  );

  return [chainId, chain, walletChainId, walletChain, chains as unknown as CustomChain[]];
}
