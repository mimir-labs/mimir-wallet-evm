// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import React, { useContext } from 'react';

import { WalletConnectContext } from '../WalletConnectProvider';
import Connect from './Connect';
import Session from './Session';

function WalletConnectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { sessionProposal, sessions } = useContext(WalletConnectContext);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalBody className='p-5'>
          {sessionProposal ? <Session proposal={sessionProposal} onClose={onClose} /> : <Connect sessions={sessions} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(WalletConnectModal);
