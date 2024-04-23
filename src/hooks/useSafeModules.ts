// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useMemo } from 'react';
import { useChainId, useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';

const SENTINEL_MODULES: Address = '0x0000000000000000000000000000000000000001' as const;

export function useSafeModuleEnabled(safeAddress?: Address, moduleAddress?: Address): boolean {
  const chainId = useChainId();
  const { data: isModuleEnabled } = useReadContract({
    chainId,
    address: safeAddress,
    abi: abis.SafeL2,
    functionName: 'isModuleEnabled',
    args: moduleAddress ? [moduleAddress] : undefined
  });

  return !!isModuleEnabled;
}

export function useSafeModules(address?: Address): Address[] {
  const chainId = useChainId();

  const { data: modules } = useReadContract({
    chainId,
    address,
    abi: abis.SafeL2,
    functionName: 'getModulesPaginated',
    args: [SENTINEL_MODULES, 100n]
  });

  return useMemo(() => {
    const _modules: Address[] = (modules?.[0] as Address[]) || [];

    return _modules || [];
  }, [modules]);
}
