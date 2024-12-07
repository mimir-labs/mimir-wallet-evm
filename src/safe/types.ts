// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Account, Chain, Hash, Hex, PublicClient, Transport, WalletClient } from 'viem';

export type SafeInfo = {
  owners: Address[];
  threshold: bigint;
};

export interface Multisig {
  name: string | undefined | null;
  address: Address;
  chainId: number;
  isMimir: boolean;
  createdAt: number;
  updatedAt: number;
  members: Address[];
  threshold: number;
  singleton: Address;
  factory: Address;
  version: string;
  block: number;
  transaction: Hash;
  updateBlock?: number;
  updateTransaction?: Hash;
  readonly: boolean;
}

export type IWalletClient = WalletClient<Transport, Chain, Account>;
export type IPublicClient = PublicClient<Transport, Chain>;

export enum Operation {
  Call,
  DelegateCall
}

export interface MetaTransaction {
  to: Address;
  value: bigint;
  data: Hex;
  operation: Operation;
}

export interface SafeTransaction extends MetaTransaction {
  safeTxGas: bigint;
  baseGas: bigint;
  gasPrice: bigint;
  gasToken: Address;
  refundReceiver: Address;
  nonce: bigint;
}

export type AccountType = 'safe';
export interface BaseAccount {
  type?: AccountType;
  name?: string | null;
  address: Address;
  isMimir: boolean;
  createdAt: number;
  updatedAt: number;

  members?: BaseAccount[];
  threshold?: number;
  supportedChains: number[];
}

export interface SafeAccount extends BaseAccount {
  type: 'safe';
  members: BaseAccount[];
  threshold: number;

  // safe singleton address
  singleton: Address;
  // safe factory address
  factory: Address;

  // safe account version
  version: string;

  // created block height
  block: number;
  // created transaction hash
  transaction: Hash;
  // update transaction hash
  updateBlock?: number;
  // update transaction hash
  updateTransaction?: Hash;
}

export enum SignatureType {
  'contract_signature' = 0,
  'approve_hash_signature' = 1,
  'eoa_signature' = 2,
  'eoa_signature_without_messagehash' = 3
}

export interface Eip712Message {
  domain: Record<string, string | number>;
  message: Record<string, unknown>;
  primaryType: string;
  types: Record<string, unknown>;
}

export type SafeMessage = string | Eip712Message;
