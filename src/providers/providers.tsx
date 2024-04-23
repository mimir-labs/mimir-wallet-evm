// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NextUIProvider } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

import { ToastRoot } from '@mimir-wallet/components';

import AddressProvider from './address-provider';
import SafeProvider from './safe-provider';
import WalletProvider from './WalletProvider';

function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <WalletProvider>
        <AddressProvider>
          <SafeProvider>
            {children}
            <ToastRoot />
          </SafeProvider>
        </AddressProvider>
      </WalletProvider>
    </NextUIProvider>
  );
}

export default Providers;
