// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash, Hex } from 'viem';
import type { Operation } from '@mimir-wallet/safe/types';

export enum TransactionStatus {
  Pending,
  Successed,
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
  | 'changeThreshold';

export interface CallArgs {
  [other: string]: unknown;
  multiSend: [Hex];
  transferToken: [token: Address, receiver: Address, amount: bigint];
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

export type Token = {
  name: string;
  symbol: string;
  decimals: number;
};

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
