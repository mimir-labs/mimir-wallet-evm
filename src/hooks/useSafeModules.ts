// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { EmptyArray } from '@mimir-wallet/constants';
import { useCurrentChain } from '@mimir-wallet/hooks';

const SENTINEL_MODULES: Address = '0x0000000000000000000000000000000000000001' as const;

export function useSafeModuleEnabled(safeAddress?: Address, moduleAddress?: Address): boolean {
  const [chainId] = useCurrentChain();
  const { data: isModuleEnabled } = useReadContract({
    chainId,
    address: safeAddress,
    abi: abis.SafeL2,
    functionName: 'isModuleEnabled',
    args: moduleAddress ? [moduleAddress] : undefined
  });

  return !!isModuleEnabled;
}

export function useSafeModules(address?: Address): [modules: Address[], isFetched: boolean, isFetching: boolean] {
  const [chainId] = useCurrentChain();

  const {
    data: modules,
    isFetched,
    isFetching
  } = useReadContract({
    chainId,
    address,
    abi: abis.SafeL2,
    functionName: 'getModulesPaginated',
    args: [SENTINEL_MODULES, 100n]
  });

  return [(modules?.[0] as Address[]) || EmptyArray, isFetched, isFetching];
}
