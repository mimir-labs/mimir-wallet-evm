// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { getDefaultConfig, lightTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';

import { AddressIcon } from '@mimir-wallet/components';

const queryClient = new QueryClient();

const projectId = '7d03930c3d8c2558da5d59066df0877a';

const config = getDefaultConfig({
  appName: 'Mimir Wallet',
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com	')
  }
});

const defaultTheme = lightTheme({
  accentColor: '#5F45FF',
  accentColorForeground: '#FFF',
  borderRadius: 'medium',
  fontStack: 'system'
});

const theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    actionButtonBorder: '#F4F0FF',
    actionButtonBorderMobile: '#F4F0FF',
    actionButtonSecondaryBackground: '#F4F0FF',
    connectButtonBackgroundError: '#E82F5E',
    connectButtonText: '#151F34',
    connectionIndicator: '#00DBA6',
    downloadBottomCardBackground: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)',
    downloadTopCardBackground: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)',
    error: '#E82F5E',
    modalText: '#151F34'
  },
  fonts: { body: 'inherit' },
  radii: {
    ...defaultTheme.radii,
    actionButton: '10px',
    connectButton: '10px',
    menuButton: '10px',
    modal: '20px',
    modalMobile: '15px'
  },
  shadows: {
    ...defaultTheme.shadows,
    connectButton: '0px 4px 12px rgba(21, 31, 52, 0.1)',
    dialog: '0px 8px 32px rgba(21, 31, 52, 0.32)',
    profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
    selectedOption: '0px 2px 6px rgba(21, 31, 52, 0.24)',
    selectedWallet: '0px 2px 6px rgba(21, 31, 52, 0.12)',
    walletLogo: '0px 2px 16px rgba(21, 31, 52, 0.16)'
  }
} as Theme;

function WalletProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale='en-US' avatar={AddressIcon} theme={theme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletProvider;
