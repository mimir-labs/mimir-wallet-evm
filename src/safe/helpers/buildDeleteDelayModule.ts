// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, SafeTransaction } from '../types';

import { type Address, encodeFunctionData, isAddressEqual } from 'viem';

import { abis } from '@mimir-wallet/abis';

import { getNonce } from '../account';
import { getModulesMap } from '../modules';
import { buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

// @internal
// find the prev module
function findPrevModule(modules: Map<Address, Address>, module: Address): Address {
  let prevModule: Address | null = null;

  for (const [prev, current] of modules) {
    if (current) {
      if (isAddressEqual(current, module)) {
        prevModule = prev;
      }
    }
  }

  if (!prevModule) {
    throw new Error(`Cant find prevModule for module(${module})`);
  }

  return prevModule;
}

export async function buildDeleteDelayModule(
  client: IPublicClient,
  safeAccount: Address,
  delayAddress: Address,
  moduleAddress: Address,
  nonce?: bigint
): Promise<SafeTransaction> {
  const isModuleEnabled = await client.readContract({
    address: delayAddress,
    abi: abis.Delay,
    functionName: 'isModuleEnabled',
    args: [moduleAddress]
  });

  if (!isModuleEnabled) {
    throw new Error('Module is not enabled');
  }

  const modulesMap = await getModulesMap(client, delayAddress);

  const prevModule = findPrevModule(modulesMap, moduleAddress);

  nonce ??= await getNonce(client, safeAccount);

  return buildSafeTransaction(delayAddress, nonce, {
    data: encodeFunctionData({
      abi: abis.Delay,
      functionName: 'disableModule',
      args: [prevModule, moduleAddress]
    }),
    operation: Operation.Call
  });
}
