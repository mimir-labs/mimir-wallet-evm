// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';
import type { CreateMultisigState } from './useCreateMultisig';

import { Divider, Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/react';
import React from 'react';

import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import { Alert, Button, ButtonEnable, CongratsAnimation, TxError } from '@mimir-wallet/components';

interface Props {
  state: CreateMultisigState;
  isOpen: boolean;
  onRetry: (wallet: IWalletClient, client: IPublicClient) => void;
  onDone: (chainId: number, account: AccountResponse) => void;
  onClose: () => void;
}

function CreateMultisigModal({ isOpen, onDone, state, onClose, onRetry }: Props) {
  const { steps, title, error, result, isLoading } = state;

  return (
    <Modal
      placement='auto'
      size='md'
      isOpen={isOpen}
      hideCloseButton={state.isLoading}
      onClose={state.isLoading ? undefined : onClose}
    >
      <ModalContent>
        <ModalBody className='flex flex-col items-center gap-5 py-10'>
          {result ? <CongratsAnimation /> : <img src={LogoCircle} className='w-[70px]' alt='mimir' />}
          <h4 className='font-extrabold text-xl'>{title}</h4>
          {error ? <Alert severity='error' title={<TxError error={error} />} /> : null}
          {steps.map(([key, element]) => (
            <React.Fragment key={key}>{element}</React.Fragment>
          ))}
        </ModalBody>
        <Divider />
        <ModalFooter className='justify-center'>
          {result ? (
            <Button onClick={() => onDone(result.chainId, result)} color='primary' radius='full'>
              Start Using
            </Button>
          ) : (
            <ButtonEnable onClick={onRetry} disabled={isLoading} color='primary' radius='full'>
              {isLoading ? 'Progressing...' : 'Retry'}
            </ButtonEnable>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(CreateMultisigModal);
