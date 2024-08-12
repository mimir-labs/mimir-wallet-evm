// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import Button from './Button';

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      console.log(`SW Registered: ${r}`);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    }
  });

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <Modal size='xs' onClose={close}>
      <ModalContent>
        <ModalHeader>Updated</ModalHeader>
        <ModalBody>
          <span>New content available, click on reload button to update.</span>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' variant='bordered' onClick={() => close()}>
            Close
          </Button>
          {needRefresh && (
            <Button color='primary' onClick={() => updateServiceWorker(true)}>
              Reload
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ReloadPrompt;
