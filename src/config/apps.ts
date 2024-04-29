// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import AppRecovery from '@mimir-wallet/assets/images/app-recovery.svg';
import Failed from '@mimir-wallet/assets/images/failed.svg';
import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';

type AppConfig = {
  name: string;
  url: string;
  icon: string;
  Component?: () => Promise<React.ComponentType>; // only for mimir://dapp/*
};

export const apps: AppConfig[] = [
  {
    name: 'Setup Member',
    url: 'mimir://internal/setup',
    icon: LogoCircle
  },
  {
    name: 'Easy Expense',
    url: 'mimir://internal/spend-limit',
    icon: LogoCircle
  },
  {
    name: 'Account Recovery',
    url: 'mimir://internal/recovery',
    icon: AppRecovery
  },
  {
    name: 'Cancel Recovery',
    url: 'mimir://internal/cancel-recovery',
    icon: Failed
  },
  {
    name: 'Transfer',
    url: 'mimir://app/transfer',
    icon: LogoCircle,
    Component: () => import('@mimir-wallet/apps/transfer').then((res) => res.default)
  }
];
