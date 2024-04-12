// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

const projectId = '7d03930c3d8c2558da5d59066df0877a';

// 2. Create wagmiConfig
const metadata = {
  name: 'Mimir Wallet',
  description: 'Mimi Wallet - Multisig account',
  url: 'https://mimir.global',
  icons: ['https://app.mimir.global/favicon.svg']
};

const chains = [mainnet, sepolia] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  multiInjectedProviderDiscovery: true
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'inherit',
    '--w3m-color-mix': '#CEBFFF',
    '--w3m-accent': '#5F45FF',
    '--w3m-border-radius-master': '10px'
  }
});

function WalletProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletProvider;
