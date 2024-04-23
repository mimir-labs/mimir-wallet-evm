// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, MetaTransaction, SafeTransaction } from '../types';

import { type Address, encodeFunctionData } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';

import { getNonce } from '../account';
import { buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

export async function buildDeleteAllowance(
  client: IPublicClient,
  safeAccount: Address,
  delegateAddress: Address,
  tokenAddress: Address,
  nonce?: bigint
): Promise<SafeTransaction> {
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

  nonce ??= await getNonce(client, safeAccount);

  return buildSafeTransaction(txs[0].to, nonce, {
    data: txs[0].data,
    operation: txs[0].operation,
    value: txs[0].value
  });
}
