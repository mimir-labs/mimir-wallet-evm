// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { type Config, WagmiProvider } from 'wagmi';

import { ToastRoot } from '@mimir-wallet/components';
import { WalletConnectProvider } from '@mimir-wallet/features/wallet-connect';

import AddressProvider from './address-provider';
import SafeTxProvider from './safe-tx-provider';
import WalletProvider from './WalletProvider';

function Providers({ config, children }: { config: Config; children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <NextThemesProvider attribute='class' defaultTheme='light'>
        <WagmiProvider config={config}>
          <WalletProvider>
            <AddressProvider>
              <SafeTxProvider>
                <WalletConnectProvider>
                  {children}
                  <ToastRoot />
                </WalletConnectProvider>
              </SafeTxProvider>
            </AddressProvider>
          </WalletProvider>
        </WagmiProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}

export default Providers;
