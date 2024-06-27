// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain, defineChain, FallbackTransport, http, isAddress, Transport } from 'viem';
import { darwinia, moonbeam, scroll, scrollSepolia, sepolia } from 'viem/chains';
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
  },
  {
    ...darwinia,
    blockExplorers: {
      default: {
        name: 'Explorer',
        url: 'https://explorer.darwinia.network/',
        apiUrl: 'https://explorer.darwinia.network/api'
      }
    },
    shortName: 'dar',
    iconUrl: '/chain-icons/46.svg',
    nativeCurrencyIcon: '/token-icons/RING.svg'
  },
  {
    ...defineChain({
      id: 44,
      name: 'Crab Network',
      nativeCurrency: {
        decimals: 18,
        name: 'CRAB',
        symbol: 'CRAB'
      },
      rpcUrls: {
        default: {
          http: ['https://crab-rpc.darwinia.network']
        }
      },
      blockExplorers: {
        default: {
          name: 'Explorer',
          url: 'https://crab-scan.darwinia.network',
          apiUrl: 'https://crab-scan.darwinia.network/api'
        }
      },
      contracts: {
        multicall3: {
          address: '0xca11bde05977b3631167028862be2a173976ca11',
          blockCreated: 599936
        }
      }
    }),
    shortName: 'cra',
    iconUrl: '/chain-icons/44.svg',
    nativeCurrencyIcon: '/token-icons/Crab.svg'
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
  const localAddress = store.get(`${CURRENT_ACCOUNT_KEY}:${chain.id}`) as string;

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
