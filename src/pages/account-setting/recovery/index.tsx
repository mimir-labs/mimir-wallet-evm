// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import {
  Card,
  CardBody,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import { isAddress } from 'viem';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { Button, ButtonEnable, Input } from '@mimir-wallet/components';
import { useDelayModules, useInputAddress } from '@mimir-wallet/hooks';
import { SafeContext } from '@mimir-wallet/providers';
import { buildAddRecovery } from '@mimir-wallet/safe';
import { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import Recoverer from './Recoverer';

const reviewWindows = {
  [60 * 60 * 24 * 2]: '2 Days',
  [60 * 60 * 24 * 7]: '7 Days',
  [60 * 60 * 24 * 14]: '14 Days',
  [60 * 60 * 24 * 28]: '28 Days',
  [60 * 60 * 24 * 56]: '56 Days'
} as const;

const expiryTimes = {
  0: 'Never',
  [60 * 60 * 24 * 2]: '2 Days',
  [60 * 60 * 24 * 7]: '7 Days',
  [60 * 60 * 24 * 14]: '14 Days',
  [60 * 60 * 24 * 28]: '28 Days',
  [60 * 60 * 24 * 56]: '56 Days'
} as const;

function Recovery({ address }: { address?: Address }) {
  const { openTxModal } = useContext(SafeContext);
  const [isOpen, toggleOpen] = useToggle(false);
  const [[recoverer], setRecoverer] = useInputAddress();
  const [cooldown, setCooldown] = useState<number>(60 * 60 * 24 * 28);
  const [expiration, setExpiration] = useState<number>(60 * 60 * 24 * 28);
  const [data] = useDelayModules(address);
  const navigate = useNavigate();

  const items = [
    {
      img: '/images/recovery-1.webp',
      title: 'Choose a Recoverer and set a review window',
      desc: 'Only your chosen Recoverer can initiate the recovery process. The process can be cancelled at any time during the review window.'
    },
    {
      img: '/images/recovery-2.webp',
      title: 'Lost access? Let the Recoverer connect',
      desc: 'The recovery process can be initiated by a trusted Recoverer when connected to your Multisig Account.'
    },
    {
      img: '/images/recovery-3.webp',
      title: 'Start the recovery process',
      desc: 'Your Recoverer initiates the recovery process by proposing a new Multisig Account setup on-chain.'
    },
    {
      img: '/images/recovery-4.webp',
      title: 'All done! The Account is yours again',
      desc: 'Once the review window has passed, you can execute the recovery proposal and regain access to your Multisig Account.'
    }
  ];

  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!address || !isAddress(recoverer)) return;

      const safeTx = await buildAddRecovery(client, address, recoverer, cooldown, expiration, data.at(0)?.address);

      toggleOpen(false);
      openTxModal(
        {
          website: 'mimir://internal/recovery',
          isApprove: false,
          address,
          safeTx
        },
        () => navigate('/transactions')
      );
    },
    [address, cooldown, data, expiration, navigate, openTxModal, recoverer, toggleOpen]
  );

  return (
    <>
      <Card>
        <CardBody className='p-5 space-y-4'>
          <h6 className='font-bold text-small'>Account Recovery</h6>
          <Divider />
          {items.map((item, index) => (
            <div key={index} className='flex items-start gap-4'>
              <img className='w-[30px]' src={item.img} alt={item.title} />
              <div>
                <h6 className='font-bold text-small'>{item.title}</h6>
                <p className='mt-1 text-tiny text-foreground/50'>{item.desc}</p>
              </div>
            </div>
          ))}
          <Divider />
          {address && <Recoverer data={data} safeAccount={address} />}
          <Button onClick={toggleOpen} fullWidth radius='full' color='primary'>
            Add Recovery
          </Button>
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader className='font-bold'>Set New Recoverer</ModalHeader>
          <ModalBody>
            <Input
              variant='bordered'
              labelPlacement='outside'
              onChange={setRecoverer}
              value={recoverer}
              label='Address'
              placeholder='Enter ethereum address'
            />
            <div>
              <div className='font-bold text-small mb-1.5'>Review Window</div>
              <Dropdown placement='bottom-start'>
                <DropdownTrigger>
                  <Button endContent={<ArrowDown />} fullWidth className='justify-between' variant='bordered'>
                    {reviewWindows[cooldown]}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={(key) => setCooldown(Number(key))}>
                  {Object.entries(reviewWindows).map(([key, value]) => (
                    <DropdownItem key={key}>{value}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <div>
              <div className='font-bold text-small mb-1.5'>Proposal Expiry</div>
              <Dropdown placement='bottom-start'>
                <DropdownTrigger>
                  <Button endContent={<ArrowDown />} fullWidth className='justify-between' variant='bordered'>
                    {expiryTimes[expiration]}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={(key) => setExpiration(Number(key))}>
                  {Object.entries(expiryTimes).map(([key, value]) => (
                    <DropdownItem key={key}>{value}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </ModalBody>
          <ModalFooter>
            <ButtonEnable onClick={handleClick} isToastError fullWidth radius='full' color='primary'>
              Confirm
            </ButtonEnable>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Recovery);
