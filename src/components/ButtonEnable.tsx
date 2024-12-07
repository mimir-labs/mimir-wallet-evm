// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps, EnableClickHandler } from './types';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import React, { forwardRef } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { useCurrentChain } from '@mimir-wallet/hooks';

import Button from './Button';
import { toastError } from './ToastRoot';

export interface ButtonEnableProps extends Omit<ButtonProps, 'onClick'> {
  chainId?: number;
  Component?: React.ComponentType<ButtonProps>;
  onClick?: EnableClickHandler;
  isToastError?: boolean;
  withConnect?: boolean;
  connectText?: React.ReactNode;
}

const ButtonEnable = forwardRef(
  (
    {
      chainId: propsChainId,
      children,
      Component = Button,
      onClick,
      isToastError,
      connectText = 'Connect Wallet',
      withConnect,
      disabled,
      ...props
    }: ButtonEnableProps,
    ref: React.Ref<HTMLButtonElement> | undefined
  ): React.ReactElement => {
    const { address, isConnected } = useAccount();
    const [_chainId] = useCurrentChain();
    const chainId = propsChainId ?? _chainId;
    const [, , , , chains] = useCurrentChain();

    const client = usePublicClient({ chainId });
    const { data: wallet } = useWalletClient({
      chainId,
      account: address
    });
    const { openConnectModal } = useConnectModal();

    const [{ loading }, handleClick] = useAsyncFn(async () => {
      try {
        if (wallet && client) {
          const walletChainId = await wallet.getChainId();

          if (walletChainId !== chainId) {
            await wallet.switchChain({ id: chainId });
          }

          await onClick?.(wallet, client);
        }
      } catch (error) {
        if (isToastError) {
          toastError(error);
        }

        throw error;
      }
    }, [wallet, client, chainId, onClick, isToastError]);

    const supportedChain = !!chains.find((item) => item.id === chainId);

    if (isConnected && address) {
      if (supportedChain) {
        return (
          <Component
            {...props}
            onClick={handleClick}
            disabled={disabled || props.isLoading || loading}
            isLoading={loading || props.isLoading}
            ref={ref}
          >
            {children}
          </Component>
        );
      }

      return (
        <Component {...props} disabled ref={ref}>
          {props.isIconOnly ? children : 'Wrong Network'}
        </Component>
      );
    }

    if (withConnect) {
      return (
        <Component onClick={openConnectModal} {...props} ref={ref} isIconOnly={false}>
          {connectText}
        </Component>
      );
    }

    return (
      <Component {...props} onClick={undefined} isLoading={props.isLoading ?? loading} disabled ref={ref}>
        {children}
      </Component>
    );
  }
);

export default React.memo(ButtonEnable);
