// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenInfo } from './types';

import { useQuery } from '@tanstack/react-query';

import { assetsSrviceUrl } from '@mimir-wallet/config';

export function useQueryTokens() {
  const { data } = useQuery<TokenInfo[]>({
    initialData: [],
    queryKey: [assetsSrviceUrl(`tokens`)]
  });

  return data;
}
