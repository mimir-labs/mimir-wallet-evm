// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, MetaTransaction, SafeTransaction } from '../types';

import { randomBytes } from 'crypto';
import { type Address, bytesToBigInt, encodeAbiParameters, encodeFunctionData, Hex } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';

import { getNonce } from '../account';
import { buildMultiSendSafeTx } from '../multisend';
import { buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

function createSetupDelay(owner: Address, avatar: Address, target: Address, cooldown: bigint, expiration: bigint): Hex {
  return encodeFunctionData({
    abi: abis.Delay,
    functionName: 'setUp',
    args: [
      encodeAbiParameters(
        [{ type: 'address' }, { type: 'address' }, { type: 'address' }, { type: 'uint256' }, { type: 'uint256' }],
        [owner, avatar, target, cooldown, expiration]
      )
    ]
  });
}

export async function buildAddRecovery(
  client: IPublicClient,
  safeAccount: Address,
  recoverer: Address,
  cooldown: number,
  expiration: number,
  delayAddress?: Address,
  nonce?: bigint
): Promise<SafeTransaction> {
  const moduleProxyFactory = deployments[client.chain.id].ModuleProxyFactory;
  const delaySingleton = deployments[client.chain.id].modules.Delay;

  const txs: MetaTransaction[] = [];

  const initializer = createSetupDelay(safeAccount, safeAccount, safeAccount, BigInt(cooldown), BigInt(expiration));
  const salt = bytesToBigInt(randomBytes(32));

  if (!delayAddress) {
    const { result: _delayAddress } = await client.simulateContract({
      address: moduleProxyFactory,
      abi: abis.ModuleProxyFactory,
      functionName: 'deployModule',
      args: [delaySingleton, initializer, salt]
    });

    txs.push({
      to: moduleProxyFactory,
      value: 0n,
      data: encodeFunctionData({
        abi: abis.ModuleProxyFactory,
        functionName: 'deployModule',
        args: [delaySingleton, initializer, salt]
      }),
      operation: Operation.Call
    });
    delayAddress = _delayAddress;

    txs.push({
      to: safeAccount,
      value: 0n,
      data: encodeFunctionData({
        abi: abis.SafeL2,
        functionName: 'enableModule',
        args: [delayAddress]
      }),
      operation: Operation.Call
    });
  }

  txs.push({
    to: delayAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: abis.Delay,
      functionName: 'enableModule',
      args: [recoverer]
    }),
    operation: Operation.Call
  });

  nonce ??= await getNonce(client, safeAccount);

  if (txs.length > 1) {
    return buildMultiSendSafeTx(client.chain, txs, nonce);
  }

  return buildSafeTransaction(txs[0].to, nonce, {
    data: txs[0].data,
    operation: txs[0].operation
  });
}