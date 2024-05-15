// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient, MetaTransaction, SafeTransaction } from '@mimir-wallet/safe/types';
import type { ButtonEnableProps } from './ButtonEnable';

import { Modal, Tooltip } from '@nextui-org/react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useMultisig, useSafeNonce } from '@mimir-wallet/hooks';

import ButtonEnable from './ButtonEnable';
import { SafeTxModal } from './safe-tx-modal';

interface Props extends ButtonEnableProps {
  isApprove: boolean;
  isCancel: boolean;
  isSignatureReady?: boolean;
  address?: Address;
  safeTx?: SafeTransaction;
  cancelNonce?: bigint;
  signatures?: SignatureResponse[];
  website?: string;
  addressChain?: Address[];
  onSuccess?: () => void;
  buildTx?: (wallet: IWalletClient, client: IPublicClient) => Promise<MetaTransaction>;
}

function SafeTxButton({
  isApprove,
  isCancel,
  isSignatureReady,
  address,
  safeTx,
  cancelNonce,
  signatures,
  website,
  addressChain,
  onSuccess,
  buildTx,
  children,
  ...props
}: Props) {
  const [nonce] = useSafeNonce(address);
  const navigate = useNavigate();
  const [isOpen, toggleOpen] = useToggle(false);
  const [tx, setTx] = useState<MetaTransaction>();
  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!isApprove) {
        if (!buildTx) {
          throw new Error('Cant build meta transaction');
        }

        setTx(await buildTx(wallet, client));
      } else {
        if (!safeTx) {
          throw new Error('Cant build SafeTransaction');
        }

        setTx(safeTx);
      }

      toggleOpen(true);
    },
    [buildTx, isApprove, safeTx, toggleOpen]
  );
  const multisig = useMultisig(address);

  return (
    <>
      {multisig ? (
        isApprove && isSignatureReady ? (
          nonce === safeTx?.nonce ? (
            <ButtonEnable {...props} onClick={handleClick}>
              {children}
            </ButtonEnable>
          ) : (
            <Tooltip showArrow closeDelay={0} content='This transaction is currently in the queue' color='warning'>
              <ButtonEnable {...props} disabled>
                {children}
              </ButtonEnable>
            </Tooltip>
          )
        ) : (
          <ButtonEnable {...props} onClick={handleClick}>
            {children}
          </ButtonEnable>
        )
      ) : (
        <Tooltip showArrow closeDelay={0} content='You do not have permission to operate this account' color='warning'>
          <ButtonEnable {...props} disabled>
            {children}
          </ButtonEnable>
        </Tooltip>
      )}
      <Modal size='lg' scrollBehavior='outside' isOpen={isOpen} onClose={toggleOpen} portalContainer={document.body}>
        {tx && address && (
          <SafeTxModal
            isApprove={isApprove}
            isCancel={isCancel}
            cancelNonce={cancelNonce}
            website={website}
            addressChain={addressChain}
            onSuccess={() => {
              toggleOpen(false);
              (onSuccess || (() => navigate('/transactions')))();
            }}
            onClose={toggleOpen}
            address={address}
            tx={tx}
            safeTx={safeTx}
            signatures={signatures}
          />
        )}
      </Modal>
    </>
  );
}

export default React.memo(SafeTxButton);
