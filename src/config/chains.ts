// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain, defineChain, FallbackTransport, getAddress, http, isAddress, Transport } from 'viem';
import {
  arbitrum,
  base,
  bsc,
  crab,
  darwinia,
  fraxtal,
  lukso,
  mainnet,
  manta,
  moonbeam,
  scroll,
  scrollSepolia,
  sepolia
} from 'viem/chains';
import { type Config, createStorage, fallback } from 'wagmi';

import {
  CHAIN_RPC_URL_PREFIX,
  CURRENT_ACCOUNT_KEY,
  CURRENT_CHAINID_KEY,
  WALLET_CONNECT_PROJECT_ID
} from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

export type MimirConfig = {
  address?: Address;
  walletConfig: Config;
  refetchInterval?: number;
};

type ChainBlockExplorer = {
  name: string;
  url: string;
  apiUrl?: string | undefined;
};

export type CustomChain = Chain & {
  blockExplorers: {
    [key: string]: ChainBlockExplorer;
    default: ChainBlockExplorer;
  };
  shortName: string;
  iconUrl: string;
  nativeCurrencyIcon: string;
  interval?: number; // refetch data interval, default is 3000
};

export const supportedChains = [
  {
    ...mainnet,
    shortName: 'eth',
    iconUrl: '/chain-icons/1.webp',
    nativeCurrencyIcon: '/token-icons/ETH.webp',
    interval: 12_000
  },
  {
    ...arbitrum,
    shortName: 'arb',
    iconUrl: '/chain-icons/42161.webp',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  },
  {
    ...base,
    shortName: 'base',
    iconUrl: '/chain-icons/8453.svg',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  },
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
    nativeCurrencyIcon: '/token-icons/GLMR.svg',
    interval: 6_000
  },
  { ...scroll, shortName: 'scr', iconUrl: '/chain-icons/534352.webp', nativeCurrencyIcon: '/token-icons/ETH.webp' },
  {
    ...bsc,
    shortName: 'bnb',
    iconUrl: '/chain-icons/56.svg',
    nativeCurrencyIcon: '/token-icons/BNB.svg',
    interval: 3_000
  },
  {
    ...sepolia,
    rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com', ...sepolia.rpcUrls.default.http] } },
    shortName: 'sep',
    iconUrl: '/chain-icons/11155111.png',
    nativeCurrencyIcon: '/token-icons/ETH.webp',
    interval: 12_000
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
        name: 'Blockscout',
        url: 'https://explorer.darwinia.network/',
        apiUrl: 'https://explorer.darwinia.network/api'
      }
    },
    shortName: 'dar',
    iconUrl: '/chain-icons/46.svg',
    nativeCurrencyIcon: '/token-icons/RING.svg',
    interval: 12_000
  },
  {
    ...crab,
    blockExplorers: {
      default: {
        name: 'Blockscout',
        url: 'https://crab-scan.darwinia.network',
        apiUrl: 'https://crab-scan.darwinia.network/api'
      }
    },
    shortName: 'cra',
    iconUrl: '/chain-icons/44.svg',
    nativeCurrencyIcon: '/token-icons/Crab.svg',
    interval: 12_000
  },
  {
    ...fraxtal,
    shortName: 'frx',
    iconUrl: '/chain-icons/252.svg',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  },
  {
    ...manta,
    shortName: 'manta',
    iconUrl: '/chain-icons/169.svg',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  },
  {
    ...lukso,
    shortName: 'lukso',
    iconUrl: '/chain-icons/42.svg',
    nativeCurrencyIcon: '/token-icons/LYX.svg'
  }
] as [CustomChain, ...CustomChain[]];

if (process.env.NODE_ENV === 'development' || window.location.hostname !== 'safe.mimir.global') {
  supportedChains.push({
    ...defineChain({
      id: 1337,
      name: 'MegaETH',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: {
          http: ['https://playstation.megaeth.systems']
        }
      },
      blockExplorers: {
        default: {
          name: 'Explorer',
          url: '',
          apiUrl: ''
        }
      },
      contracts: {
        multicall3: {
          address: '0xca11bde05977b3631167028862be2a173976ca11',
          blockCreated: 1
        }
      },
      testnet: true
    }),
    shortName: 'mega',
    iconUrl: '/chain-icons/1337.png',
    nativeCurrencyIcon: '/token-icons/ETH.webp'
  });
}

export function initMimirConfig(): MimirConfig {
  const search = new URLSearchParams(window.location.search);

  const urlChainId = search.get('chainid');
  const urlAddress = search.get('address');

  let chainId: number | undefined;

  if (urlChainId && !!supportedChains.find((item) => item.id === Number(urlChainId))) {
    chainId = Number(urlChainId);
  }

  store.set(CURRENT_CHAINID_KEY, Number(urlChainId));

  if (chainId && urlAddress && isAddress(urlAddress)) {
    store.set(`${CURRENT_ACCOUNT_KEY}:${chainId}`, getAddress(urlAddress));
  }

  const storage = createStorage({
    storage: localStorage,
    key: `Mimir.wallet.v2`
  });

  const config = getDefaultConfig({
    appName: 'Mimir Wallet',
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: supportedChains,
    storage,
    multiInjectedProviderDiscovery: true,
    syncConnectedChain: true,
    transports: supportedChains.reduce<Record<string, FallbackTransport<Transport[]>>>((results, item) => {
      const rpc = store.get(`${CHAIN_RPC_URL_PREFIX}${item.id}`) as string;

      results[item.id] = rpc
        ? fallback([http(rpc), ...item.rpcUrls.default.http.map((url) => http(url))])
        : fallback([...item.rpcUrls.default.http.map((url) => http(url))]);

      return results;
    }, {}),
    appIcon: 'https://safe.mimir.global/images/logo-circle.png'
  });

  return {
    walletConfig: config
  };
}
