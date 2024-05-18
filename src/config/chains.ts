// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain, isAddress } from 'viem';
import { moonbeam, scroll, scrollSepolia, sepolia } from 'viem/chains';
import { type Config, createStorage } from 'wagmi';

import { CURRENT_ACCOUNT_KEY } from '@mimir-wallet/constants';

export type MimirConfig = {
  address?: Address;
  walletConfig: Config;
};

type ChainBlockExplorer = {
  name: string;
  url: string;
  apiUrl: string | undefined;
};

export type CustomChain = Chain & {
  blockExplorers: {
    [key: string]: ChainBlockExplorer;
    default: ChainBlockExplorer;
  };
  iconUrl: string;
};

export const supportedChains = [
  { ...moonbeam, iconUrl: '/chain-icons/1284.webp' },
  { ...scroll, iconUrl: '/chain-icons/534352.webp' },
  { ...sepolia, iconUrl: '/chain-icons/11155111.webp' },
  { ...scrollSepolia, iconUrl: '/chain-icons/534351.webp' }
] as CustomChain[];

const projectId = '7d03930c3d8c2558da5d59066df0877a';

export function initMimirConfig(): MimirConfig {
  const search = new URLSearchParams(window.location.search);
  const urlAddress = search.get('address');
  const urlChainId = search.get('chainid');

  let chain: Chain = supportedChains[0];

  if (urlChainId) {
    const _chain: Chain | undefined = supportedChains.find((chain) => chain.id === Number(urlChainId));

    if (_chain) {
      chain = _chain;
    }
  }

  const storage = createStorage({
    storage: localStorage,
    key: `wallet.${chain.id}`
  });

  const config = getDefaultConfig({
    appName: 'Mimir Wallet',
    projectId,
    chains: [chain],
    storage,
    syncConnectedChain: false
  });

  let address: Address | undefined;
  const localAddress = localStorage.getItem(`${CURRENT_ACCOUNT_KEY}:${chain.id}`);

  if (urlAddress && isAddress(urlAddress)) {
    address = urlAddress;
  } else if (localAddress && isAddress(localAddress)) {
    address = localAddress;
  }

  return {
    address,
    walletConfig: config
  };
}
