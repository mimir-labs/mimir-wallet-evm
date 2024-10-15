// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain, defineChain, FallbackTransport, getAddress, http, isAddress, Transport } from 'viem';
import {
  arbitrum,
  base,
  darwinia,
  fraxtal,
  mainnet,
  manta,
  moonbeam,
  scroll,
  scrollSepolia,
  sepolia,
  zetachain
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
    ...sepolia,
    rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com', ...sepolia.rpcUrls.default.http] } },
    shortName: 'sep',
    iconUrl: '/chain-icons/11155111.webp',
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
        name: 'Explorer',
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
    ...zetachain,
    shortName: 'zeta',
    iconUrl: '/chain-icons/7000.svg',
    nativeCurrencyIcon: '/token-icons/zeta.svg'
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
  const localChainId = store.get(CURRENT_CHAINID_KEY) as number;
  const chainId = urlChainId || localChainId;

  let chain: CustomChain = supportedChains[0];

  if (chainId) {
    const _chain: CustomChain | undefined = supportedChains.find((chain) => chain.id === Number(chainId));

    if (_chain) {
      chain = _chain;
    }
  }

  store.set(CURRENT_CHAINID_KEY, chain.id);

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
    }, {}),
    appIcon: 'https://safe.mimir.global/images/logo-circle.png'
  });

  let address: Address | undefined;
  const urlAddress = search.get('address');
  const localAddress = store.get(`${CURRENT_ACCOUNT_KEY}:${chain.id}`) as string;

  if (urlAddress && isAddress(urlAddress)) {
    address = urlAddress;
  } else if (localAddress && isAddress(localAddress)) {
    address = localAddress;
  }

  return {
    address: address ? getAddress(address) : undefined,
    walletConfig: config,
    refetchInterval: chain.interval
  };
}
