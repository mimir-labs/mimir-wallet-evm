// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import qrcode from 'qrcode-generator';
import React, { useEffect, useRef } from 'react';

import Address from './Address';
import CopyAddressButton from './CopyAddressButton';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  address: string | null | undefined;
}

function Content({ address }: { address: string }) {
  const qr = useRef(qrcode(0, 'M'));
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      qr.current = qrcode(0, 'M');

      qr.current.addData(address);
      qr.current.make();

      if (container.current) container.current.innerHTML = qr.current.createImgTag(7);
    }, 100);
  }, [address]);

  return (
    <div>
      <div ref={container} className='flex items-center justify-center mx-auto my-0 w-[300px] h-[300px]' />
      <div className='mt-5 flex items-center justify-center gap-1.5'>
        <Address showFull address={address} />
        <CopyAddressButton size='tiny' address={address} />
      </div>
    </div>
  );
}

function QrcodeAddress({ onClose, isOpen, address }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalBody className='p-5'>
          <Content address={address?.toString() || ''} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(QrcodeAddress);
