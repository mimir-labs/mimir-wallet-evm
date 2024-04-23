// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, MetaTransaction, SafeTransaction } from '../types';

import { type Address, encodeFunctionData, hexToNumber, isAddressEqual, sliceHex, zeroAddress } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';

import { getNonce } from '../account';
import { buildMultiSendSafeTx } from '../multisend';
import { buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

export async function buildAddAllowance(
  client: IPublicClient,
  safeAccount: Address,
  delegateAddress: Address,
  tokenAddress: Address,
  amount: bigint,
  resetTimeMin: number,
  resetBaseMin: number,
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
    txs.push({
      to: safeAccount,
      value: 0n,
      data: encodeFunctionData({
        abi: abis.SafeL2,
        functionName: 'enableModule',
        args: [allowanceAddress]
      }),
      operation: Operation.Call
    });
  }

  const delegate = await client.readContract({
    address: allowanceAddress,
    abi: abis.Allowance,
    functionName: 'delegates',
    args: [safeAccount, hexToNumber(sliceHex(delegateAddress, 14, 20))]
  });

  if (isAddressEqual(delegate[0], zeroAddress)) {
    txs.push({
      to: allowanceAddress,
      value: 0n,
      data: encodeFunctionData({
        abi: abis.Allowance,
        functionName: 'addDelegate',
        args: [delegateAddress]
      }),
      operation: Operation.Call
    });
  }

  txs.push({
    to: allowanceAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: abis.Allowance,
      functionName: 'setAllowance',
      args: [delegateAddress, tokenAddress, amount, resetTimeMin, resetBaseMin]
    }),
    operation: Operation.Call
  });

  nonce ??= await getNonce(client, safeAccount);

  if (txs.length > 1) {
    return buildMultiSendSafeTx(client.chain, txs, nonce, { operation: Operation.DelegateCall });
  }

  if (txs.length === 1) {
    return buildSafeTransaction(txs[0].to, nonce, {
      data: txs[0].data,
      operation: txs[0].operation,
      value: txs[0].value
    });
  }

  throw new Error('Failed');
}
