// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Chain, Hex } from 'viem';
import type { MetaTransaction, SafeTransaction } from '../types';

import {
  bytesToBigInt,
  bytesToNumber,
  concat,
  encodeFunctionData,
  encodePacked,
  getAddress,
  hexToBytes,
  toHex
} from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';
import { assert } from '@mimir-wallet/utils';

import { buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

function encodeMetaTransaction(tx: MetaTransaction): Hex {
  const data = hexToBytes(tx.data);
  const encoded = encodePacked(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [tx.operation, tx.to, tx.value, BigInt(data.length), tx.data]
  );

  return encoded;
}

export function encodeMultiSend(txs: MetaTransaction[]): Hex {
  return concat(txs.map((tx) => encodeMetaTransaction(tx)));
}

export async function buildMultiSendSafeTx(
  chain: Chain,
  txs: MetaTransaction[],
  nonce: bigint,
  overrides?: Partial<SafeTransaction>
): Promise<SafeTransaction> {
  const multisendAddress = deployments[chain.id]?.MultiSend;

  assert(multisendAddress, `multisend not support on ${chain.name}`);

  const data = encodeFunctionData({
    abi: abis.MultiSend,
    functionName: 'multiSend',
    args: [encodeMultiSend(txs)]
  });

  return buildSafeTransaction(multisendAddress, nonce, {
    ...overrides,
    operation: Operation.DelegateCall,
    data
  });
}

export function decodeMultisend(data: Hex): MetaTransaction[] {
  const bytes = hexToBytes(data);

  const results: MetaTransaction[] = [];

  for (let i = 0; i < bytes.length; ) {
    const operation: Operation = bytesToNumber(bytes.slice(i, (i += 1)));

    const to: Address = getAddress(toHex(bytes.slice(i, (i += 20))));

    const value: bigint = bytesToBigInt(bytes.slice(i, (i += 32)));

    const length: number = Number(bytesToBigInt(bytes.slice(i, (i += 32))));

    const data: Hex = toHex(bytes.slice(i, (i += length)));

    results.push({ operation, to, value, data });
  }

  return results;
}
