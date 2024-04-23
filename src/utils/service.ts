// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash, Hex } from 'viem';
import type { BaseAccount, SafeTransaction } from '@mimir-wallet/safe/types';
import type { AccountResponse } from './types';

import { serviceUrl } from '@mimir-wallet/config';

import { fetcher } from './fetcher';

const CACHE: Map<string, Promise<string> | string> = new Map();

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getServiceUrl<P extends string | null, R = P extends string ? Promise<string> : null>(
  chainId: number,
  path?: P
): R {
  if (path === null || path === undefined) {
    return null as R;
  }

  const cacheKey = `${chainId}:${path}`;

  const promise = CACHE.get(cacheKey) || serviceUrl(chainId, path);

  CACHE.set(cacheKey, promise);

  return promise as R;
}

export function createMultisig(chainId: number, hash: Hash, name?: string) {
  return fetcher(getServiceUrl(chainId, 'create-safe-tx'), {
    method: 'POST',
    body: JSON.stringify({ transaction: hash, name }),
    headers: jsonHeader
  });
}

export function getAccountFull(chainId: number, address: Address): Promise<BaseAccount> {
  return fetcher(getServiceUrl(chainId, `accounts/${address}/full`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function getAccount(chainId: number, address: Address): Promise<AccountResponse> {
  return fetcher(getServiceUrl(chainId, `accounts/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function getOwnedAccount(chainId: number, address: Address): Promise<AccountResponse[]> {
  return fetcher(getServiceUrl(chainId, `accounts/owned/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function changeName(chainId: number, address: Address, name: string, signature: Hex): Promise<unknown> {
  return fetcher(getServiceUrl(chainId, `accounts/change-name/${address}`), {
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
  website?: string
): Promise<{ success: boolean }> {
  return fetcher(getServiceUrl(chainId, 'tx'), {
    method: 'POST',
    body: JSON.stringify({ address, signature, signer, tx, addressChain, website }, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ),
    headers: jsonHeader
  });
}

export function pendingTx(chainId: number, address: Address, nonce: bigint | number | string) {
  return fetcher(getServiceUrl(chainId, `tx/pending/${address}?nonce=${nonce.toString()}`), {
    method: 'GET',
    headers: jsonHeader
  });
}

export function historyTx(chainId: number, address: Address, nonce: bigint | number | string) {
  return fetcher(getServiceUrl(chainId, `tx/history/${address}?nonce=${nonce.toString()}`), {
    method: 'GET',
    headers: jsonHeader
  });
}
