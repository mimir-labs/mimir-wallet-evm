// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { darwinia, mainnet, moonbeam, scroll, scrollSepolia, sepolia } from 'viem/chains';

export const services: Record<number, string> = {
  [mainnet.id]: 'https://evm-eth-api.mimir.global/',
  [moonbeam.id]: 'https://evm-moonbeam-api.mimir.global/',
  [scroll.id]: 'https://evm-scroll-api.mimir.global/',
  [sepolia.id]:
    process.env.NODE_ENV === 'production'
      ? window.location.hostname === 'dev-evm.mimir.global'
        ? 'https://dev-evm-sepolia-api.mimir.global/'
        : 'https://evm-sepolia-api.mimir.global/'
      : 'http://localhost:9000/',
  [scrollSepolia.id]: 'https://evm-scroll-sepolia-api.mimir.global/',
  [darwinia.id]: 'https://evm-darwinia-api.mimir.global/',
  44: 'https://evm-crab-api.mimir.global/'
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
