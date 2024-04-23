// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, ModalBody, ModalContent, ModalProps } from '@nextui-org/react';
import React from 'react';

function Drawer({ isOpen, className, classNames, children, ...props }: ModalProps): React.ReactElement {
  return (
    <Modal
      {...props}
      isOpen={isOpen}
      placement='bottom'
      size='sm'
      className={`${className}`}
      classNames={{
        wrapper: [...(classNames?.wrapper || []), 'justify-start', 'overflow-x-hidden'],
        base: [...(classNames?.base || []), 'm-0', 'sm:m-0', 'rounded-l-none', 'h-full']
      }}
      motionProps={{
        variants: {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          },
          exit: {
            x: -200,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }
        }
      }}
    >
      <ModalContent>
        <ModalBody className='p-0 pt-10'>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(Drawer);
