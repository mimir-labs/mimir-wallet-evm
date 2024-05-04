// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from 'viem';

type ExplorerType = 'address' | 'tx' | 'block' | 'token' | 'nft';

export function explorerUrl<Type extends ExplorerType>(
  type: Type,
  chain: Chain,
  value: Type extends 'nft' ? [string, string] : string | number | { toString: () => string }
): string | undefined {
  if (!chain.blockExplorers?.default.url) {
    return undefined;
  }

  const url = new URL(chain.blockExplorers.default.url);

  url.pathname = type === 'nft' ? `${type}/${(value as []).join('/')}` : `${type}/${value.toString()}`;

  return url.href;
}
