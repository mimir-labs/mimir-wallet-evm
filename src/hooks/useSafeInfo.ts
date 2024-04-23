// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useChainId, useReadContracts } from 'wagmi';

import { abis } from '@mimir-wallet/abis';

export function useSafeInfo(address?: Address) {
  const chainId = useChainId();

  const { data } = useReadContracts({
    query: {
      refetchInterval: 14_000
    },
    contracts: [
      {
        chainId,
        address,
        abi: abis.SafeL2,
        functionName: 'nonce'
      },
      {
        chainId,
        address,
        abi: abis.SafeL2,
        functionName: 'getOwners'
      },
      {
        chainId,
        address,
        abi: abis.SafeL2,
        functionName: 'getThreshold'
      },
      {
        chainId,
        address,
        abi: abis.SafeL2,
        functionName: 'VERSION'
      }
    ],
    allowFailure: false
  });

  return data;
}
