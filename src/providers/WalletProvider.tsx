// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { lightTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Config, WagmiProvider } from 'wagmi';

import { AddressIconJazz } from '@mimir-wallet/components';
import { fetcher } from '@mimir-wallet/utils/fetcher';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 12_000,
      queryFn: ({ queryKey }) => (queryKey[0] ? fetcher(queryKey[0] as string) : undefined)
    }
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
    actionButtonBorder: '#F5F3FF',
    actionButtonBorderMobile: '#F5F3FF',
    actionButtonSecondaryBackground: '#F5F3FF',
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

function WalletProvider({ children, config }: { config: Config; children: React.ReactNode }): JSX.Element {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale='en-US' avatar={AddressIconJazz} theme={theme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletProvider;
