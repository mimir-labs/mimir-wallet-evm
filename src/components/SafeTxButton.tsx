// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient, MetaTransaction, SafeTransaction } from '@mimir-wallet/safe/types';
import type { ButtonEnableProps } from './ButtonEnable';

import { Tooltip } from '@nextui-org/react';
import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMultisig, useSafeNonce } from '@mimir-wallet/hooks';
import { SafeTxContext } from '@mimir-wallet/providers';

import Button from './Button';
import ButtonEnable from './ButtonEnable';

interface Props extends ButtonEnableProps {
  isApprove: boolean;
  isCancel: boolean;
  isSignatureReady?: boolean;
  address?: Address;
  safeTx?: SafeTransaction;
  cancelNonce?: bigint;
  signatures?: SignatureResponse[];
  metadata?: { website?: string; iconUrl?: string; appName?: string };
  addressChain?: Address[];
  onSuccess?: () => void;
  buildTx?: (wallet: IWalletClient, client: IPublicClient) => Promise<MetaTransaction | undefined>;
  onOpenTx?: () => void;
}

function SafeTxButton({
  isApprove,
  isCancel,
  isSignatureReady,
  address,
  safeTx,
  cancelNonce,
  signatures,
  metadata,
  addressChain,
  onSuccess,
  buildTx,
  onOpenTx,
  children,
  ...props
}: Props) {
  const [nonce] = useSafeNonce(address);
  const navigate = useNavigate();
  const { addTx } = useContext(SafeTxContext);
  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!address) return;

      if (!isApprove) {
        if (!buildTx) {
          throw new Error('Cant build meta transaction');
        }

        const tx = await buildTx(wallet, client);

        if (!tx) return;

        addTx({
          isApprove,
          isCancel,
          address,
          tx,
          safeTx: undefined,
          cancelNonce: isCancel ? cancelNonce : undefined,
          signatures: undefined,
          metadata,
          addressChain,
          onSuccess: () => {
            (onSuccess || (() => navigate('/transactions')))();
          }
        });
      } else {
        if (!safeTx) {
          throw new Error('Cant build SafeTransaction');
        }

        addTx({
          isApprove,
          isCancel,
          address,
          tx: safeTx,
          safeTx,
          cancelNonce: isCancel ? cancelNonce : undefined,
          signatures,
          metadata,
          addressChain,
          onSuccess: () => {
            (onSuccess || (() => navigate('/transactions')))();
          }
        });
      }

      onOpenTx?.();
    },
    [
      addTx,
      address,
      addressChain,
      buildTx,
      cancelNonce,
      isApprove,
      isCancel,
      metadata,
      navigate,
      onOpenTx,
      onSuccess,
      safeTx,
      signatures
    ]
  );
  const multisig = useMultisig(address);

  if (isSignatureReady) {
    // transaction can execute
    return nonce === safeTx?.nonce ? (
      <ButtonEnable {...props} onClick={handleClick}>
        {children}
      </ButtonEnable>
    ) : (
      <Tooltip showArrow closeDelay={0} content='This transaction is currently in the queue' color='warning'>
        <Button {...props} onClick={undefined} disabled>
          {children}
        </Button>
      </Tooltip>
    );
  }

  if (!multisig) {
    // not member
    return (
      <Tooltip showArrow closeDelay={0} content='You are not one of the multisig members' color='warning'>
        <Button {...props} onClick={undefined} disabled>
          {children}
        </Button>
      </Tooltip>
    );
  }

  return (
    <ButtonEnable {...props} onClick={handleClick}>
      {children}
    </ButtonEnable>
  );
}

export default React.memo(SafeTxButton);
