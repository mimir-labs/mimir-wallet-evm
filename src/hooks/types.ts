// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash, Hex } from 'viem';
import type { Operation, SafeMessage } from '@mimir-wallet/safe/types';

export enum TransactionStatus {
  Pending,
  Success,
  Failed,
  Replaced
}

export interface TransactionResponse {
  hash: Hash;
  to: Address;
  value: bigint;
  data: Hex;
  operation: Operation;
  safeTxGas: bigint;
  baseGas: bigint;
  gasPrice: bigint;
  gasToken: Address;
  refundReceiver: Address;
  nonce: bigint;
  address: Address;
  status: TransactionStatus;
  createdAt: number;
  updatedAt: number;
  payment: bigint;
  executeThreshold?: number;
  executeBlock?: bigint;
  executeTransaction?: Hash;
  executor?: Address;
  sender?: Address;
  replaceBlock?: bigint; // replace block when status === Replaced
  replaceHash?: Hash; // replace transaction hash when status === Replaced
  replaceSafeHash?: Hash; // replace safe transaction hash when status === Replaced
  website?: string;
  iconUrl?: string;
  appName?: string;
}

export interface MessageResponse {
  hash: Hash;
  mesasge: SafeMessage;
  address: Address;
  creator: Address;
  createdAt: number;
  updatedAt: number;
  website?: string;
  iconUrl?: string;
  appName?: string;
}

export interface SignatureResponse {
  uuid: string;
  isStart: boolean;
  createdAt: number;
  signature: {
    signer: Address;
    signature: Hex;
  };
  children?: SignatureResponse[];
}

export type CallFunctions = string;

export interface ParsedCall<F extends CallFunctions = CallFunctions> {
  functionName: F;
  args: unknown[];
  names: (string | undefined)[];
  types: string[];
}

export interface TokenMeta {
  chainId: number;
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

export interface TokenInfo extends TokenMeta {
  icon?: string | null;
}

export type AccountAsset = {
  tokenAddress: Address;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string | null;
  price: string;
  balance: string;
  balanceWei: string;
  balanceUsd: string;
};

export type AccountBalances = {
  assets: AccountAsset[];
  totalBalanceUsd: string;
  totalCount: number;
};

export interface Trait {
  trait_type: string;
  value: string;
}
export interface Nft {
  blockchain: string;
  name: string;
  tokenId: string;
  tokenUrl: string;
  imageUrl: string;
  collectionName: string;
  symbol: string;
  contractType: 'ERC721' | 'ERC1155' | 'UNDEFINED';
  contractAddress: Address;
  quantity?: string;
  traits?: Trait[];
}

export interface BatchTxItem {
  id: number;
  to: Address;
  value: string;
  data: Hex;
  operation: Operation;
  website?: string;
  iconUrl?: string;
  appName?: string;
}

export interface ModuleTransactionResponse {
  address: Address;
  block: bigint;
  blockHash: Hash;
  createdAt: string;
  data: Hex;
  id: number;
  module: Address;
  operation: Operation;
  status: 'success' | 'failed' | null;
  to: Address;
  transaction: Hash;
  updatedAt: string;
  value: bigint;
}

export interface AllowanceTransactionResponse {
  id: number;
  transaction: Hash;
  block: bigint;
  blockHash: Hash;
  type:
    | 'AddDelegate'
    | 'RemoveDelegate'
    | 'ExecuteAllowanceTransfer'
    | 'PayAllowanceTransfer'
    | 'SetAllowance'
    | 'ResetAllowance'
    | 'DeleteAllowance';
  safe: Address;
  delegate: Address;
  token: Address | null;
  to: Address | null;
  value: bigint | null;
  nonce: number | null;
  paymentToken: Address | null;
  paymentReceiver: Address | null;
  payment: bigint | null;
  allowanceAmount: bigint | null;
  resetTime: number | null;
  createdAt: number;
}

export interface ReceivedResponse {
  address: Address;
  block: bigint;
  blockHash: Hash;
  createdAt: string;
  id: number;
  sender: Address;
  token: Address;
  tokenMeta: { name: string; symbol: string; decimals: number } | null;
  transaction: Hash;
  updatedAt: string;
  value: bigint;
}

export type TransactionSignature = {
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
};
export enum HistoryType {
  SafeTx,
  ModuleTx,
  Received
}

export type HistoryData = {
  address: Address;
  relatedId: string;
  type: HistoryType;
  time: number;
  data: TransactionSignature | ModuleTransactionResponse | ReceivedResponse;
};
