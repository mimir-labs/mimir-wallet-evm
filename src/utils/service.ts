// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash, Hex } from 'viem';
import type { BaseAccount, SafeMessage, SafeTransaction } from '@mimir-wallet/safe/types';
import type { AccountResponse } from './types';

import { serviceUrl } from '@mimir-wallet/config';

import { fetcher } from './fetcher';

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getAccountFull(chainId: number, address: Address): Promise<BaseAccount> {
  return fetcher(serviceUrl(chainId, `accounts/${address}/full`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function getAccount(chainId: number, address: Address): Promise<AccountResponse> {
  return fetcher(serviceUrl(chainId, `accounts/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function getOwnedAccount(chainId: number, address: Address): Promise<AccountResponse[]> {
  return fetcher(serviceUrl(chainId, `accounts/owned/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function createMultisig(chainId: number, hash: Hash, name?: string) {
  return fetcher(serviceUrl(chainId, 'create-safe-tx'), {
    method: 'POST',
    body: JSON.stringify({ transaction: hash, name }),
    headers: jsonHeader
  });
}

export function changeName(chainId: number, address: Address, name: string, signature: Hex): Promise<unknown> {
  return fetcher(serviceUrl(chainId, `accounts/change-name/${address}`), {
    method: 'PATCH',
    headers: jsonHeader,
    body: JSON.stringify({ name, signature })
  });
}

export function createTx(
  chainId: number,
  address: Address,
  signature: Hex,
  signer: Address,
  tx: SafeTransaction,
  addressChain?: Address[],
  website?: string,
  iconUrl?: string,
  appName?: string
): Promise<{ success: boolean }> {
  return fetcher(serviceUrl(chainId, 'tx'), {
    method: 'POST',
    body: JSON.stringify({ address, signature, signer, tx, addressChain, website, iconUrl, appName }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ),
    headers: jsonHeader
  });
}

export function createMessage(
  chainId: number,
  address: Address,
  signature: Hex,
  signer: Address,
  message: SafeMessage,
  addressChain?: Address[],
  website?: string,
  iconUrl?: string,
  appName?: string
): Promise<{ success: boolean }> {
  return fetcher(serviceUrl(chainId, 'message'), {
    method: 'POST',
    body: JSON.stringify({ address, signature, signer, message, addressChain, website, iconUrl, appName }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ),
    headers: jsonHeader
  });
}

export function simulateTx(
  chainId: number,
  bundles: { from: Address; to: Address; value: string; data: Hex }[]
): Promise<{ success: boolean; simulation?: unknown[] }> {
  return fetcher(serviceUrl(chainId, 'simulate'), {
    method: 'POST',
    body: JSON.stringify({ bundles }),
    headers: jsonHeader
  });
}

export function getSafeTx(chainId: number, hash: string): Promise<{ executeTransaction?: Hash }> {
  return fetcher(serviceUrl(chainId, `tx/${hash}`), {
    method: 'GET',
    headers: jsonHeader
  });
}
