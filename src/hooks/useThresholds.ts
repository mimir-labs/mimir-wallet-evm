// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';
import { getAddress } from 'viem';

import { AddressContext } from '@mimir-wallet/providers';

export function useThresholds(
  chainId: number,
  address?: string | null
): [threshold: number, memberCounts: number] | undefined {
  const { multisigs, watchlist, queryCache } = useContext(AddressContext);

  return useMemo(() => {
    if (!address) {
      return undefined;
    }

    const multisig = multisigs[address]?.find((item) => item.chainId === chainId);

    if (multisig) {
      return [multisig.threshold, multisig.members.length];
    }

    const watch = watchlist[address]?.find((item) => item.chainId === chainId);

    if (watch) {
      return [watch.threshold, watch.members.length];
    }

    const cache = queryCache[chainId]?.[getAddress(address)];

    if (cache) {
      return [cache.threshold, cache.members.length];
    }

    return undefined;
  }, [address, chainId, multisigs, queryCache, watchlist]);
}
