// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { sepolia } from 'viem/chains';

export const services: Record<number, string> = {
  [sepolia.id]: process.env.NODE_ENV === 'production' ? 'https://dev-evm-api.mimir.global/' : 'http://localhost:9000/'
};

export function serviceUrl(chainId: number, path: string): string {
  const base = services[chainId];

  if (!base) {
    throw new Error('Not supported chain');
  }

  return `${base}${path}`;
}
