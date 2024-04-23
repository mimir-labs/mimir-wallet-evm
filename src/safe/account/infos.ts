// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { PublicClient } from 'viem';

import { abis } from '@mimir-wallet/abis';

export const SENTINEL_OWNERS: Address = '0x0000000000000000000000000000000000000001' as const;

export async function getNonce(client: PublicClient, address: Address): Promise<bigint> {
  return client.readContract({
    address,
    abi: abis.SafeL2,
    functionName: 'nonce'
  });
}

export async function getOwners(client: PublicClient, address: Address): Promise<Address[]> {
  return client.readContract({
    address,
    abi: abis.SafeL2,
    functionName: 'getOwners'
  }) as Promise<Address[]>;
}

export async function getOwnersMap(client: PublicClient, address: Address): Promise<Map<Address, Address>> {
  const owners = await getOwners(client, address);

  const map = new Map<Address, Address>();

  let currentOwner: Address = SENTINEL_OWNERS;

  for (const owner of owners) {
    map.set(currentOwner, owner);
    currentOwner = owner;
  }

  return map;
}

export async function safeInfos(client: PublicClient, address: Address) {
  return client.multicall({
    allowFailure: false,
    contracts: [
      {
        address,
        abi: abis.SafeL2,
        functionName: 'nonce'
      },
      {
        address,
        abi: abis.SafeL2,
        functionName: 'getOwners'
      },
      {
        address,
        abi: abis.SafeL2,
        functionName: 'VERSION'
      }
    ]
  });
}
