// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

import { serviceUrl } from '@mimir-wallet/config';

export function useSafeStats(safeAddress?: Address | null) {
  const chainId = useChainId();

  const { data, isFetched, isFetching } = useQuery<{
    moduleCounts: Record<Address, number>;
    txCounts: Record<Address, number>;
    moduleTxCounts: number;
    safeTxCounts: number;
    txDaily: Array<{ time: string; address: Address; counts: number }>;
  }>({
    queryHash: serviceUrl(chainId, `stats/${safeAddress}`),
    queryKey: [safeAddress ? serviceUrl(chainId, `stats/${safeAddress}`) : null]
  });

  return [data, isFetched, isFetching] as const;
}
