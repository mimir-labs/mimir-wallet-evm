// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash } from 'viem';
import type { AccountResponse } from './types';

import { serviceUrl } from '@mimir-wallet/config';

import { fetcher } from './fetcher';

const CACHE: Map<string, Promise<string> | string> = new Map();

export const jsonHeader = { 'Content-Type': 'application/json' };

export const getAuthorizationHeader = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export function getServiceUrl<P extends string | null, R = P extends string ? Promise<string> : null>(chainId: number, path?: P): R {
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

export function getAccount(chainId: number, address: Address): Promise<AccountResponse> {
  return fetcher(getServiceUrl(chainId, `accounts/${address}`), {
    method: 'GET',
    headers: jsonHeader
  });
}
