// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { mainnet, sepolia } from 'viem/chains';

interface TokenInfo {
  decimals: number;
  name: string;
  symbol: string;
  icon: string;
}

interface TokenList {
  default: TokenInfo;
  [key: Address]: TokenInfo;
}

const tokens: Record<number, TokenList> = {
  [mainnet.id]: {
    default: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
      icon: `/tokens/ETH.webp`
    }
  },
  [sepolia.id]: {
    default: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
      icon: `/tokens/ETH.webp`
    }
  }
};

export function findToken(chainId: number, address?: Address): TokenInfo {
  return (
    tokens[chainId]?.[address || 'default'] || {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
      icon: `/tokens/ETH.webp`
    }
  );
}
