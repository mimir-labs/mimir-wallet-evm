// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';
import { getAddress } from 'viem';

import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

export function useThresholds(address?: string | null): [threshold: number, memberCounts: number] | undefined {
  const { multisigs, otherChainMultisigs, queryCache } = useContext(AddressContext);

  return useMemo(() => {
    if (!address) {
      return undefined;
    }

    const cache = queryCache[getAddress(address)];

    if (cache) {
      return [cache.threshold, cache.members.length];
    }

    const multisig = multisigs.find((item) => addressEq(item.address, address));

    if (multisig) {
      return [multisig.threshold, multisig.members.length];
    }

    const otherChainMultisig = otherChainMultisigs.find((item) => addressEq(item.address, address));

    if (otherChainMultisig) {
      return [otherChainMultisig.threshold, otherChainMultisig.members.length];
    }

    return undefined;
  }, [address, multisigs, otherChainMultisigs, queryCache]);
}
