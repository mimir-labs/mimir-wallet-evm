// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash, Hex } from 'viem';
import type { Operation } from '@mimir-wallet/safe/types';

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
  replaceBlock?: bigint; // replace block when status === Replaced
  replaceHash?: Hash; // replace transaction hash when status === Replaced
  replaceSafeHash?: Hash; // replace safe transaction hash when status === Replaced
  website?: string;
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

export type CallFunctions =
  | 'multiSend'
  | 'transferToken'
  | 'addOwnerWithThreshold'
  | 'removeOwner'
  | 'swapOwner'
  | 'changeThreshold'
  | 'transfer';

export interface CallArgs {
  [other: string]: unknown;
  multiSend: [Hex];
  transferToken: [token: Address, receiver: Address, amount: bigint];
  transfer: [receiver: Address, amount: bigint];
  addOwnerWithThreshold: [owner: Address, threshold: bigint];
  removeOwner: [prevOwner: Address, owner: Address, threshold: bigint];
  swapOwner: [prevOwner: Address, oldOwner: Address, newOwner: Address];
  changeThreshold: [threshold: bigint];
}

export interface ParsedCall<F extends CallFunctions = CallFunctions> {
  functionName: F;
  args: CallArgs[F];
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
}
