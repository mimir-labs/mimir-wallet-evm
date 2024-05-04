// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useQuery } from '@tanstack/react-query';

import { assetsSrviceUrl } from '@mimir-wallet/config';

type TokenResponse = {
  address: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string | null;
};

export function useQueryTokens() {
  const { data } = useQuery<TokenResponse[]>({
    initialData: [],
    queryKey: [assetsSrviceUrl(`tokens`)]
  });

  return data;
}
