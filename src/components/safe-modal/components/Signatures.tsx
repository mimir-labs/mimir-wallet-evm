// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';

import SignatureOverview from '@mimir-wallet/components/SignatureOverview';

function Signatures({
  isOpen,
  safeAccount,
  signatures,
  onClose
}: {
  isOpen: boolean;
  safeAccount?: BaseAccount | null;
  signatures?: SignatureResponse[];
  onClose: () => void;
}) {
  return (
    <Modal size='5xl' placement='center' isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalBody>
          <div className='w-full h-[60vh]'>
            {safeAccount && <SignatureOverview account={safeAccount} signatures={signatures} />}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Signatures;
