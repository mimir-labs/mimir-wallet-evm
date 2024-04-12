// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EnableClickHandler } from '@mimir-wallet/components/types';
import type { CreateMultisigState } from './useCreateMultisig';

import { Divider, Modal, ModalBody, ModalContent, ModalFooter, Progress } from '@nextui-org/react';
import React from 'react';

import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import { Alert, Button, ButtonEnable, TxError } from '@mimir-wallet/components';

interface Props {
  state: CreateMultisigState;
  isOpen: boolean;
  onRetry: EnableClickHandler;
  onDone: () => void;
}

function CreateMultisigModal({ isOpen, onDone, state, onRetry }: Props) {
  const { steps, title, error, isLoading } = state;

  return (
    <Modal placement='auto' size='md' isOpen={isOpen} hideCloseButton>
      <ModalContent>
        <ModalBody className='flex flex-col items-center gap-5 py-10'>
          <img src={LogoCircle} className='w-[70px]' alt='mimir' />
          <h4 className='font-extrabold text-xl'>{title}</h4>
          {error ? <Alert severity='error' title={<TxError error={error} />} /> : null}
          {steps.map(([key, element]) => (
            <React.Fragment key={key}>{element}</React.Fragment>
          ))}
        </ModalBody>
        <Divider />
        <ModalFooter className='justify-center'>
          {isLoading ? (
            <Progress size='md' isStriped isIndeterminate color='primary' />
          ) : state.currentStep === state.steps.length - 1 ? (
            <Button onClick={onDone} color='primary' radius='full'>
              Start Using
            </Button>
          ) : (
            <ButtonEnable onClick={onRetry} isLoading={isLoading} color='primary' radius='full'>
              Retry
            </ButtonEnable>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(CreateMultisigModal);
