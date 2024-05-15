// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, MetaTransaction } from '../types';

import { type Address, encodeFunctionData } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';

import { buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

export async function buildDeleteAllowance(
  client: IPublicClient,
  safeAccount: Address,
  delegateAddress: Address,
  tokenAddress: Address
): Promise<MetaTransaction> {
  const allowanceAddress = deployments[client.chain.id].modules.Allowance;

  const txs: MetaTransaction[] = [];
  const isModuleEnabled = await client.readContract({
    address: safeAccount,
    abi: abis.SafeL2,
    functionName: 'isModuleEnabled',
    args: [allowanceAddress]
  });

  if (!isModuleEnabled) {
    throw new Error('Module is not enabled');
  }

  txs.push({
    to: allowanceAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: abis.Allowance,
      functionName: 'deleteAllowance',
      args: [delegateAddress, tokenAddress]
    }),
    operation: Operation.Call
  });

  return buildSafeTransaction(txs[0].to, {
    data: txs[0].data,
    operation: txs[0].operation,
    value: txs[0].value
  });
}
