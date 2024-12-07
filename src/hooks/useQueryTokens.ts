// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenInfo } from './types';

import { useQuery } from '@tanstack/react-query';

import { assetsSrviceUrl } from '@mimir-wallet/config';
import { useCurrentChain } from '@mimir-wallet/hooks';

export function useQueryTokens() {
  const [chainId] = useCurrentChain();
  const { data } = useQuery<TokenInfo[]>({
    initialData: [],
    queryKey: [assetsSrviceUrl(`tokens/${chainId}`)],
    refetchInterval: false
  });

  return data;
}
