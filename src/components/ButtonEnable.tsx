// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps, EnableClickHandler } from './types';

import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import React, { useCallback } from 'react';
import { useAccount, useChains, usePublicClient, useWalletClient } from 'wagmi';

import Button from './Button';

interface Props extends Omit<ButtonProps, 'onClick'> {
  Component?: React.ComponentType<ButtonProps>;
  onClick?: EnableClickHandler;
}

function ButtonEnable({ children, Component = Button, onClick, disabled, ...props }: Props): React.ReactElement {
  const { address, chainId, isConnected } = useAccount();
  const chains = useChains();
  const client = usePublicClient();
  const { data: wallet } = useWalletClient({
    account: address
  });
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const handleClick = useCallback(() => {
    if (wallet && client) onClick?.(wallet, client);
  }, [client, onClick, wallet]);

  return isConnected && address && client && wallet ? (
    chains.find((item) => item.id === chainId) ? (
      <Component {...props} onClick={handleClick} disabled={disabled}>
        {children}
      </Component>
    ) : (
      <Component onClick={openChainModal} {...props}>
        Switch Network
      </Component>
    )
  ) : (
    <Component onClick={openConnectModal} {...props}>
      Connect Wallet
    </Component>
  );
}

export default React.memo(ButtonEnable);
