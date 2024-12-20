// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { moduleDeployments } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';
import { useCurrentChain } from '@mimir-wallet/hooks';

export function useAllowanceDelegates(
  safeAddress: Address
): [data: Address[], isFetched: boolean, isFetching: boolean] {
  const [chainId] = useCurrentChain();
  const {
    data: startAccount,
    isFetched,
    isFetching
  } = useReadContract({
    chainId,
    address: moduleDeployments[chainId].Allowance[0],
    abi: abis.Allowance,
    functionName: 'delegatesStart',
    args: [safeAddress]
  });

  const {
    data: delegates,
    isFetched: isFetched2,
    isFetching: isFetching2
  } = useReadContract({
    chainId,
    address: moduleDeployments[chainId].Allowance[0],
    abi: abis.Allowance,
    functionName: 'getDelegates',
    args: startAccount ? [safeAddress, startAccount, 100] : undefined
  });

  return [(delegates?.[0] || EmptyArray) as Address[], isFetched && isFetched2, isFetching || isFetching2];
}
