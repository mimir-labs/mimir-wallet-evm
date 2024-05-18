// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, decodeFunctionData, decodeFunctionResult, encodeFunctionData, hexToBigInt, zeroAddress } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';
import { addressEq, service } from '@mimir-wallet/utils';

import { decodeMultisend } from '../multisend';
import { type IPublicClient, type MetaTransaction } from '../types';

export async function simulate(client: IPublicClient, tx: MetaTransaction, safeAddress: Address) {
  const accessorAddress = deployments[client.chain.id].SimulateTxAccessor;

  const simulationData = encodeFunctionData({
    abi: abis.SimulateTxAccessor,
    functionName: 'simulate',
    args: [tx.to, tx.value, tx.data, tx.operation]
  });

  const { result } = await client.simulateContract({
    address: safeAddress,
    abi: abis.CompatibilityFallbackHandler,
    functionName: 'simulate',
    args: [accessorAddress, simulationData]
  });

  const res = await service.simulateTx(
    client.chain.id,
    (tx.to === deployments[client.chain.id].MultiSend
      ? decodeMultisend(
          decodeFunctionData({
            abi: [abis.MultiSend[1]],
            data: tx.data
          }).args[0]
        )
      : [{ from: safeAddress, to: tx.to, value: tx.value.toString(), data: tx.data }]
    ).map((item) => ({ from: safeAddress, to: item.to, value: item.value.toString(), data: item.data }))
  );

  const assetChanges: { from: Address; to: Address; amount: bigint; tokenAddress: Address; logo?: string }[] = [];

  for (const item of res.simulation || []) {
    for (const change of (item as any).assetChanges || []) {
      if ((change.from && addressEq(change.from, safeAddress)) || (change.to && addressEq(change.to, safeAddress))) {
        assetChanges.push({
          from: change.from,
          to: change.to,
          amount: hexToBigInt(change.rawAmount),
          logo: change.assetInfo?.logo,
          tokenAddress: change.assetInfo?.contractAddress || zeroAddress
        });
      }
    }
  }

  const data = decodeFunctionResult({
    abi: abis.SimulateTxAccessor,
    functionName: 'simulate',
    data: result
  });

  return {
    success: data[1],
    assetChanges
  };
}
