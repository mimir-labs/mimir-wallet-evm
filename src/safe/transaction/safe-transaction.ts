// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Address, Chain, Hash, hashTypedData, Hex, keccak256, zeroAddress } from 'viem';

import { encodeTypedData } from '@mimir-wallet/utils';

import { TypedDataTypes } from '../config';
import { Operation, type SafeTransaction } from '../types';

export function buildSafeTransaction(to: Address, nonce: bigint, overrides: Partial<SafeTransaction>): SafeTransaction {
  return {
    to,
    value: overrides.value || 0n,
    data: overrides.data || '0x',
    operation: overrides.operation || Operation.Call,
    safeTxGas: overrides.safeTxGas || 0n,
    baseGas: overrides.baseGas || 0n,
    gasPrice: overrides.gasPrice || 0n,
    gasToken: overrides.gasToken || zeroAddress,
    refundReceiver: overrides.refundReceiver || zeroAddress,
    nonce
  };
}

export function encodeSafeTransaction(chain: Chain, address: Address, tx: SafeTransaction): Hex {
  return encodeTypedData({
    domain: {
      chainId: chain.id,
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

export function hashSafeTransaction(chain: Chain, address: Address, tx: SafeTransaction): Hash {
  return keccak256(encodeSafeTransaction(chain, address, tx));
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
