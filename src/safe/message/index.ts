// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Hash, Hex } from 'viem';
import type { SafeMessage } from '../types';

import { hashMessage, hashTypedData } from 'viem';

import { encodeTypedData } from '@mimir-wallet/utils';

import { TypedDataTypes } from '../config';

export function encodeSafeMessage(chainId: number, address: Address, message: SafeMessage): Hex {
  return encodeTypedData({
    domain: {
      chainId,
      verifyingContract: address
    } as const,
    types: TypedDataTypes.safeMessage,
    primaryType: 'SafeMessage',
    message: {
      message: generateSafeMessageMessage(message)
    }
  });
}

export function hashSafeMessage(chainId: number, address: Address, message: SafeMessage): Hash {
  return hashTypedData({
    domain: {
      chainId,
      verifyingContract: address
    } as const,
    types: TypedDataTypes.safeMessage,
    primaryType: 'SafeMessage',
    message: {
      message: generateSafeMessageMessage(message)
    }
  });
}

export function generateSafeMessageMessage(safeMessage: SafeMessage): Hash {
  return typeof safeMessage === 'string' ? hashMessage(safeMessage) : hashTypedData(safeMessage);
}
