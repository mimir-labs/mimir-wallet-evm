// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { darwinia, moonbeam, scroll, scrollSepolia, sepolia } from 'viem/chains';

export const services: Record<number, string> = {
  [moonbeam.id]:
    process.env.NODE_ENV === 'production' ? 'https://evm-moonbeam-api.mimir.global/' : 'http://localhost:9000/',
  [scroll.id]:
    process.env.NODE_ENV === 'production' ? 'https://evm-scroll-api.mimir.global/' : 'http://localhost:9000/',
  [sepolia.id]:
    process.env.NODE_ENV === 'production'
      ? window.location.hostname === 'dev-evm.mimir.global'
        ? 'https://dev-evm-sepolia-api.mimir.global/'
        : 'https://evm-sepolia-api.mimir.global/'
      : 'http://localhost:9000/',
  [scrollSepolia.id]:
    process.env.NODE_ENV === 'production' ? 'https://evm-scroll-sepolia-api.mimir.global/' : 'http://localhost:9000/',
  [darwinia.id]:
    process.env.NODE_ENV === 'production' ? 'https://evm-darwinia-api.mimir.global/' : 'http://localhost:9000/',
  44: process.env.NODE_ENV === 'production' ? 'https://evm-crab-api.mimir.global/' : 'http://localhost:9000/'
};

export const assetsServices =
  process.env.NODE_ENV === 'production'
    ? window.location.hostname === 'dev-evm.mimir.global'
      ? 'https://dev-evm-assets.mimir.global/'
      : 'https://evm-assets-api.mimir.global/'
    : 'http://localhost:9001/';

export function serviceUrl(chainId: number, path: string): string {
  const base = services[chainId];

  return `${base}${path}`;
}

export function assetsSrviceUrl(path: string): string {
  return `${assetsServices}${path}`;
}
