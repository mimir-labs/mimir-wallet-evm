// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { IPublicClient } from '../types';

import { abis } from '@mimir-wallet/abis';

export const SENTINEL_MODULES: Address = '0x0000000000000000000000000000000000000001' as const;

export async function getModules(
  client: IPublicClient,
  address: Address,
  start: Address = SENTINEL_MODULES
): Promise<Address[]> {
  const data = await client.readContract({
    address,
    abi: abis.SafeL2,
    functionName: 'getModulesPaginated',
    args: [start, 100n]
  });

  const modules: Address[] = data[0] as Address[];
  const next = data[1];

  if (next !== SENTINEL_MODULES) {
    modules.push(...(await getModules(client, address, next)));
  }

  return modules;
}

export async function getModulesMap(client: IPublicClient, address: Address): Promise<Map<Address, Address>> {
  const owners = await getModules(client, address);

  const map = new Map<Address, Address>();

  let currentOwner: Address = SENTINEL_MODULES;

  for (const owner of owners) {
    map.set(currentOwner, owner);
    currentOwner = owner;
  }

  return map;
}
