// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Address, Chain, encodeFunctionData, Hash, hashTypedData, Hex, keccak256 } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';
import { assert, encodeTypedData } from '@mimir-wallet/utils';

import { TypedDataTypes } from '../config';
import { encodeMultiSend } from '../multisend';
import { MetaTransaction, Operation, type SafeTransaction } from '../types';

export function buildSafeTransaction(to: Address, overrides: Partial<SafeTransaction>): MetaTransaction {
  return {
    to,
    value: overrides.value || 0n,
    data: overrides.data || '0x',
    operation: overrides.operation || Operation.Call
  };
}

export function encodeSafeTransaction(chainId: number, address: Address, tx: SafeTransaction): Hex {
  return encodeTypedData({
    domain: {
      chainId,
      verifyingContract: address
    } as const,
    types: TypedDataTypes.safeTx,
    primaryType: 'SafeTx',
    message: {
      to: tx.to,
      value: tx.value,
      data: tx.data,
      operation: tx.operation,
      safeTxGas: tx.safeTxGas,
      baseGas: tx.baseGas,
      gasPrice: tx.gasPrice,
      gasToken: tx.gasToken,
      refundReceiver: tx.refundReceiver,
      nonce: tx.nonce
    }
  });
}

export function hashSafeTransaction(chainId: number, address: Address, tx: SafeTransaction): Hash {
  return keccak256(encodeSafeTransaction(chainId, address, tx));
}

export function hashSafeMessage(chain: Chain, address: Address, bytes: Hex): Hash {
  const domain = {
    chainId: chain.id,
    verifyingContract: address
  } as const;

  const types = TypedDataTypes.safeMessage;

  return hashTypedData({
    domain,
    types,
    primaryType: 'SafeMessage',
    message: {
      message: bytes
    }
  });
}

export async function buildMultiSendSafeTx(
  chain: Chain,
  txs: MetaTransaction[],
  overrides?: Partial<SafeTransaction>
): Promise<MetaTransaction> {
  const multisendAddress = deployments[chain.id]?.MultiSend;

  assert(multisendAddress, `multisend not support on ${chain.name}`);

  const data = encodeFunctionData({
    abi: abis.MultiSend,
    functionName: 'multiSend',
    args: [encodeMultiSend(txs)]
  });

  return buildSafeTransaction(multisendAddress, {
    ...overrides,
    operation: Operation.DelegateCall,
    data
  });
}
