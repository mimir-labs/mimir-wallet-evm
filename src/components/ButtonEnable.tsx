// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps, EnableClickHandler } from './types';

import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useChains, usePublicClient, useWalletClient } from 'wagmi';

import Button from './Button';
import { toastError } from './ToastRoot';

interface Props extends Omit<ButtonProps, 'onClick'> {
  Component?: React.ComponentType<ButtonProps>;
  onClick?: EnableClickHandler;
  isToastError?: boolean;
}

function ButtonEnable({
  children,
  Component = Button,
  onClick,
  isToastError,
  disabled,
  ...props
}: Props): React.ReactElement {
  const { address, chainId, isConnected } = useAccount();
  const chains = useChains();
  const client = usePublicClient();
  const { data: wallet } = useWalletClient({
    account: address
  });
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const [{ loading }, handleClick] = useAsyncFn(async () => {
    try {
      if (wallet && client) await onClick?.(wallet, client);
    } catch (error) {
      if (isToastError) {
        toastError(error);
      }

      throw error;
    }
  }, [client, onClick, isToastError, wallet]);

  return isConnected && address && client && wallet ? (
    chains.find((item) => item.id === chainId) ? (
      <Component
        {...props}
        onClick={handleClick}
        disabled={disabled || props.isLoading || loading}
        isLoading={props.isLoading ?? loading}
      >
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
