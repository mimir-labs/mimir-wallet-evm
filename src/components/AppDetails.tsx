// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppConfig } from '@mimir-wallet/config';

import { Chip, Divider, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import React from 'react';

import IconDiscord from '@mimir-wallet/assets/svg/icon-discord.svg?react';
import IconGithub from '@mimir-wallet/assets/svg/icon-github.svg?react';
import IconWebsite from '@mimir-wallet/assets/svg/icon-website.svg?react';
import IconX from '@mimir-wallet/assets/svg/icon-x.svg?react';

import Button from './Button';

interface Props {
  open: boolean;
  app: AppConfig;
  onClose: () => void;
}

function Contents({ app }: { app: AppConfig }) {
  return (
    <ModalBody>
      <div className='flex flex-col gap-2.5'>
        <div className='flex items-center gap-2.5 [&>a]:w-6 [&>a]:h-6'>
          {app.tags.map((tag) => (
            <Chip size='sm' key={tag} color='secondary'>
              {tag}
            </Chip>
          ))}
          <Divider orientation='vertical' style={{ height: 12 }} />
          {app.website && (
            <Button as='a' isIconOnly color='secondary' href={app.website} size='sm' radius='full' target='_blank'>
              <IconWebsite />
            </Button>
          )}
          {app.github && (
            <Button as='a' isIconOnly color='secondary' href={app.github} size='sm' radius='full' target='_blank'>
              <IconGithub />
            </Button>
          )}
          {app.discord && (
            <Button as='a' isIconOnly color='secondary' href={app.discord} size='sm' radius='full' target='_blank'>
              <IconDiscord />
            </Button>
          )}
          {app.twitter && (
            <Button as='a' isIconOnly color='secondary' href={app.twitter} size='sm' radius='full' target='_blank'>
              <IconX />
            </Button>
          )}
        </div>
        <h6 className='font-medium text-medium'>{app.desc}</h6>
      </div>
    </ModalBody>
  );
}

function DappDetails({ app, onClose, open }: Props) {
  return (
    <Modal size='md' onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-2.5'>
          <img src={app.icon} alt={app.name} style={{ width: 64, height: 64 }} />
          <h3 className='font-bold text-2xl'>{app.name}</h3>
        </ModalHeader>
        <Contents app={app} />
        <ModalFooter className='justify-center'>
          <Button
            color='primary'
            radius='full'
            as={Link}
            style={{ width: 195 }}
            href={`/apps/${encodeURIComponent(app.url)}`}
          >
            Open
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(DappDetails);
