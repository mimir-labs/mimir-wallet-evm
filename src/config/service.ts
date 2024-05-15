// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { moonbeam, scroll, sepolia } from 'viem/chains';

export const services: Record<number, string> = {
  [moonbeam.id]:
    process.env.NODE_ENV === 'production' ? 'https://dev-evm-moonbeam-api.mimir.global/' : 'http://localhost:9000/',
  [scroll.id]:
    process.env.NODE_ENV === 'production' ? 'https://dev-evm-scroll-api.mimir.global/' : 'http://localhost:9000/',
  [sepolia.id]: process.env.NODE_ENV === 'production' ? 'https://dev-evm-api.mimir.global/' : 'http://localhost:9000/'
};

export const assetsServices =
  process.env.NODE_ENV === 'production' ? 'https://dev-evm-assets.mimir.global/' : 'http://localhost:9001/';

export function serviceUrl(chainId: number, path: string): string {
  const base = services[chainId];

  return `${base}${path}`;
}

export function assetsSrviceUrl(path: string): string {
  return `${assetsServices}${path}`;
}
