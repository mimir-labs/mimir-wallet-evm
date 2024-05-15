// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';
import type { Config } from 'wagmi';

import { NextUIProvider } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

import { ToastRoot } from '@mimir-wallet/components';

import AddressProvider from './address-provider';
import WalletProvider from './WalletProvider';

function Providers({ config, address, children }: { config: Config; address?: Address; children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <WalletProvider config={config}>
        <AddressProvider defaultCurrent={address}>
          {children}
          <ToastRoot />
        </AddressProvider>
      </WalletProvider>
    </NextUIProvider>
  );
}

export default Providers;
