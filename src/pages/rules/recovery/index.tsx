// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip
} from '@nextui-org/react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconQuestion from '@mimir-wallet/assets/svg/icon-question.svg?react';
import { Button, InputAddress, SafeTxButton } from '@mimir-wallet/components';
import { useDelayModules, useRecoveryTxs } from '@mimir-wallet/features/delay';
import { useCurrentChain, useInputAddress } from '@mimir-wallet/hooks';
import { buildAddRecovery } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import TooltipItem from '../TooltipItem';
import Recoverer from './Recoverer';

const reviewWindows = {
  [60 * 10]: '10 Mins',
  [60 * 60 * 24 * 2]: '2 Days',
  [60 * 60 * 24 * 7]: '7 Days',
  [60 * 60 * 24 * 14]: '14 Days',
  [60 * 60 * 24 * 28]: '28 Days',
  [60 * 60 * 24 * 56]: '56 Days'
} as const;

const expiryTimes = {
  0: 'Never',
  [60 * 10]: '10 Mins',
  [60 * 60 * 24 * 2]: '2 Days',
  [60 * 60 * 24 * 7]: '7 Days',
  [60 * 60 * 24 * 14]: '14 Days',
  [60 * 60 * 24 * 28]: '28 Days',
  [60 * 60 * 24 * 56]: '56 Days'
} as const;

function Recovery({ address }: { address?: Address }) {
  const [chainId] = useCurrentChain();
  const { address: account } = useAccount();
  const [isOpen, toggleOpen] = useToggle(false);
  const [isAlertOpen, toggleAlertOpen] = useToggle(false);
  const [[recoverer], setRecoverer] = useInputAddress();
  const [cooldown, setCooldown] = useState<number>(60 * 60 * 24 * 28);
  const [expiration, setExpiration] = useState<number>(60 * 60 * 24 * 28);
  const [data, isDataFetched, isDataFetching] = useDelayModules(address);
  const navigate = useNavigate();
  const [recoverTxs] = useRecoveryTxs(chainId, address);

  const recoveryInfo = useMemo(
    () =>
      data.length > 0 && account
        ? data.find((item) => item.modules.findIndex((item) => addressEq(item, account)) > -1)
        : null,
    [account, data]
  );

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

  return (
    <div className='space-y-2.5'>
      <div className='flex items-center gap-2.5'>
        <h6 className='font-bold'>Account Recovery</h6>
        <IconQuestion onClick={toggleAlertOpen} className='cursor-pointer text-foreground/20' />
        <div className='flex-1 text-right'>
          {recoveryInfo &&
            (recoverTxs.length > 0 ? (
              <Tooltip
                closeDelay={0}
                content='Please process the ongoing Recovery first'
                color='warning'
                placement='bottom'
              >
                <Button radius='full' color='primary' variant='bordered' disabled>
                  Execute Recover
                </Button>
              </Tooltip>
            ) : (
              <Button
                as={Link}
                href={`/reset/${recoveryInfo.address}`}
                radius='full'
                color='primary'
                variant='bordered'
              >
                Execute Recover
              </Button>
            ))}
          {isDataFetched && data.filter((item) => item.modules.length > 0).length === 0 && (
            <Button onClick={toggleOpen} radius='full' color='primary' variant='bordered'>
              Add New
            </Button>
          )}
        </div>
      </div>

      {address && (
        <Recoverer safeAccount={address} data={data} isDataFetched={isDataFetched} isDataFetching={isDataFetching} />
      )}

      <Modal isOpen={isAlertOpen} onClose={toggleAlertOpen}>
        <ModalContent>
          <ModalHeader>Account Recovery</ModalHeader>
          <ModalBody className='pb-5'>
            {items.map((item, index) => (
              <div key={index} className='flex items-start gap-4'>
                <img className='w-[30px]' src={item.img} alt={item.title} />
                <div>
                  <h6 className='font-bold text-small'>{item.title}</h6>
                  <p className='mt-1 text-tiny text-foreground/50'>{item.desc}</p>
                </div>
              </div>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal size='md' isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent className='overflow-y-visible'>
          <ModalHeader className='font-bold'>Set New Recoverer</ModalHeader>
          <ModalBody className='py-5'>
            <InputAddress
              isSign={false}
              onChange={setRecoverer}
              value={recoverer}
              label='Address'
              placeholder='Enter ethereum address'
            />
            <div>
              <div className='font-bold text-small mb-1.5'>
                <TooltipItem content='A period that begins after a recovery submitted on-chain, during which the Safe Account signers can review the proposal and cancel it before it is executable.'>
                  Review Window
                </TooltipItem>
              </div>
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
              <div className='font-bold text-small mb-1.5'>
                <TooltipItem content='A period after which the recovery proposal will expire and can no longer be executed.'>
                  Proposal Expiry
                </TooltipItem>
              </div>
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
            <SafeTxButton
              metadata={{ website: 'mimir://internal/recovery' }}
              isApprove={false}
              isCancel={false}
              address={address}
              buildTx={
                address && isAddress(recoverer)
                  ? (_, client) =>
                      buildAddRecovery(client, address, recoverer, cooldown, expiration, data.at(0)?.address)
                  : undefined
              }
              onSuccess={() => navigate('/transactions')}
              isToastError
              fullWidth
              radius='full'
              color='primary'
              onOpenTx={toggleOpen}
            >
              Confirm
            </SafeTxButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default React.memo(Recovery);
