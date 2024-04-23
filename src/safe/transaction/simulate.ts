// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, SafeTransaction } from '../types';

import { Address, decodeFunctionResult, encodeFunctionData } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';

export async function simulate(client: IPublicClient, tx: SafeTransaction, address: Address) {
  const accessorAddress = deployments[client.chain.id].SimulateTxAccessor;

  const simulationData = encodeFunctionData({
    abi: abis.SimulateTxAccessor,
    functionName: 'simulate',
    args: [tx.to, tx.value, tx.data, tx.operation]
  });

  const { result } = await client.simulateContract({
    address,
    abi: abis.CompatibilityFallbackHandler,
    functionName: 'simulate',
    args: [accessorAddress, simulationData]
  });

  return decodeFunctionResult({
    abi: abis.SimulateTxAccessor,
    functionName: 'simulate',
    data: result
  });
}
