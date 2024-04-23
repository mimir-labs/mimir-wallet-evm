// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
    name: 'Spend Limit',
    url: 'mimir://internal/spend-limit',
    icon: LogoCircle
  },
  {
    name: 'Transfer',
    url: 'mimir://app/transfer',
    icon: LogoCircle,
    Component: () => import('@mimir-wallet/apps/transfer').then((res) => res.default)
  }
];
