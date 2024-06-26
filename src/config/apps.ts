// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import AppRecovery from '@mimir-wallet/assets/images/app-recovery.svg';
import BatchIcon from '@mimir-wallet/assets/images/batch.svg';
import Failed from '@mimir-wallet/assets/images/failed.svg';
import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import { FAVORITE_APP_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

export type AppConfig = {
  id: number;
  name: string;
  url: string;
  icon: string;
  desc: string;
  tags: string[];
  supportedChains?: number[];
  website?: string;
  github?: string;
  twitter?: string;
  discord?: string;
  Component?: () => Promise<React.ComponentType>; // only for mimir://dapp/*
  isDrawer?: boolean;
};

export const apps: AppConfig[] = [
  {
    id: 1,
    name: 'Setup Member',
    url: 'mimir://internal/setup',
    desc: 'Setup Member',
    tags: [],
    icon: LogoCircle
  },
  {
    id: 2,
    name: 'Easy Expense',
    url: 'mimir://internal/spend-limit',
    desc: 'Easy Expense',
    tags: [],
    icon: LogoCircle
  },
  {
    id: 3,
    name: 'Account Recovery',
    url: 'mimir://internal/recovery',
    desc: 'Account Recovery',
    tags: [],
    icon: AppRecovery
  },
  {
    id: 4,
    name: 'Cancel Recovery',
    url: 'mimir://internal/cancel-recovery',
    desc: 'Cancel Recovery',
    tags: [],
    icon: Failed
  },
  {
    id: 5,
    name: 'Cancel',
    url: 'mimir://internal/cancel-tx',
    desc: 'Cancel Transaction',
    tags: [],
    icon: Failed
  },
  {
    id: 6,
    name: 'Transfer NFT',
    url: 'mimir://internal/transfer-nft',
    desc: 'Transfer NFT',
    tags: [],
    icon: LogoCircle
  },
  {
    id: 1001,
    name: 'Transfer',
    url: 'mimir://app/transfer',
    icon: LogoCircle,
    desc: 'Swiftly complete asset transfers with other users, developed by Mimir.',
    website: 'https://mimir.global/',
    github: 'https://github.com/mimir-labs/',
    twitter: 'https://x.com/Mimir_global/',
    tags: ['Assets'],
    Component: () => import('@mimir-wallet/apps/transfer').then((res) => res.default)
  },
  {
    id: 1002,
    name: 'Batch',
    url: 'mimir://app/batch',
    icon: BatchIcon,
    desc: 'Build batch transaction',
    website: 'https://mimir.global/',
    github: 'https://github.com/mimir-labs/',
    twitter: 'https://x.com/Mimir_global/',
    tags: ['Batch'],
    Component: () => import('@mimir-wallet/apps/batch').then((res) => res.default),
    isDrawer: true
  },
  {
    id: 10001,
    name: 'Transaction Builder',
    url: 'https://dev-apps.safe.protofire.io/tx-builder/',
    icon: '/app-icons/transaction-builder.png',
    desc: 'Compose custom contract interactions and batch them into a single transaction',
    tags: ['Infrastructure']
  },
  {
    id: 10002,
    name: 'Uniswap',
    url: 'https://app.uniswap.org/',
    icon: '/app-icons/uniswap.svg',
    desc: 'Swap or provide liquidity on the Uniswap Protocol',
    supportedChains: [1, 5, 11155111, 42161, 421613, 10, 420, 137, 80001, 42220, 44787, 56],
    website: 'https://uniswap.org/',
    github: 'https://github.com/Uniswap/',
    twitter: 'https://x.com/Uniswap/',
    tags: ['Defi', 'Dex', 'Swap']
  },
  {
    id: 10003,
    name: 'Aave',
    url: 'https://app.aave.com/',
    icon: '/app-icons/aave.png',
    desc: 'Aave is an Open Source Protocol to create Non-Custodial Liquidity Markets to earn interest on supplying and borrowing assets with a variable or stable interest rate. The protocol is designed for easy integration into your products and services.',
    supportedChains: [1, 534_352],
    website: 'https://aave.com/',
    github: 'https://github.com/aave',
    twitter: 'https://x.com/aave',
    discord: 'https://discord.com/invite/aave',
    tags: ['DeFi', 'Lending/Borrowing']
  }
];

export function initializeFavoriteApps() {
  if (!store.get(FAVORITE_APP_KEY)) {
    store.set(FAVORITE_APP_KEY, [1001]);
  }
}
