// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain, FallbackTransport, http, isAddress, Transport } from 'viem';
import { moonbeam, scroll, scrollSepolia, sepolia } from 'viem/chains';
import { type Config, createStorage, fallback } from 'wagmi';

import { CHAIN_RPC_URL_PREFIX, CURRENT_ACCOUNT_KEY, WALLET_CONNECT_PROJECT_ID } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

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
  shortName: string;
  iconUrl: string;
  nativeCurrencyIcon: string;
};

export const supportedChains = [
  {
    ...moonbeam,
    rpcUrls: {
      default: {
        http: ['https://moonbeam-rpc.publicnode.com', ...moonbeam.rpcUrls.default.http],
        webSocket: ['wss://moonbeam-rpc.publicnode.com', ...moonbeam.rpcUrls.default.webSocket]
      }
    },
    shortName: 'mbeam',
    iconUrl: '/chain-icons/1284.svg',
    nativeCurrencyIcon: '/token-icons/GLMR.svg'
  },
  { ...scroll, shortName: 'scr', iconUrl: '/chain-icons/534352.webp', nativeCurrencyIcon: '/token-icons/ETH.webp' },
  {
    ...sepolia,
    rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com', ...sepolia.rpcUrls.default.http] } },
    shortName: 'sep',
    iconUrl: '/chain-icons/11155111.webp',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  },
  {
    ...scrollSepolia,
    shortName: 'scr-sepolia',
    iconUrl: '/chain-icons/534351.webp',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  }
] as [CustomChain, ...CustomChain[]];

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
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: [chain],
    storage,
    syncConnectedChain: false,
    transports: supportedChains.reduce<Record<string, FallbackTransport<Transport[]>>>((results, item) => {
      const rpc = store.get(`${CHAIN_RPC_URL_PREFIX}${item.id}`) as string;

      results[item.id] = rpc
        ? fallback([http(rpc), ...chain.rpcUrls.default.http.map((url) => http(url))])
        : fallback([...chain.rpcUrls.default.http.map((url) => http(url))]);

      return results;
    }, {})
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
