// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Hash, Hex } from 'viem';
import type { Operation } from '@mimir-wallet/safe/types';

export interface DelayModule {
  address: Address;
  modules: Address[];
  expiration: bigint;
  cooldown: bigint;
}

export interface DelayModuleResponse {
  address: Address;
  avatar: Address;
  block: string;
  initiator: Address;
  owner: Address;
  target: Address;
  transaction: Hash;
}

export interface RecoveryTx {
  address: Address;
  block: bigint;
  createdAt: number;
  data: Hex;
  id: number;
  operation: Operation;
  queueNonce: bigint;
  sender: Address;
  to: Address;
  transaction: Hash;
  txHash: Hash;
  value: bigint;
}
