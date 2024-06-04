// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import {
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
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useToggle } from 'react-use';
import { isAddress, parseEther, zeroAddress } from 'viem';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconQuestion from '@mimir-wallet/assets/svg/icon-question.svg?react';
import { Button, Input, SafeTxButton } from '@mimir-wallet/components';
import { useInputAddress, useInputNumber } from '@mimir-wallet/hooks';
import { buildAddAllowance } from '@mimir-wallet/safe';

import TooltipItem from '../TooltipItem';
import Delegates from './Delegates';

const resetTimes = {
  0: 'Once',
  [60 * 24]: '1 Day',
  [60 * 24 * 7]: '1 Week',
  [60 * 24 * 7 * 30]: '1 Month'
} as const;

function SpendLimit({ address }: { address?: Address }) {
  const [isOpen, toggleOpen] = useToggle(false);
  const [isAlertOpen, toggleAlertOpen] = useToggle(false);
  const [[delegate], setDelegate] = useInputAddress();
  const [[amount], setAmount] = useInputNumber();
  const [reset, setReset] = useState<number>(0);

  const items = [
    {
      img: '/images/spend-limit-1.webp',
      title: 'Select beneficiary',
      desc: 'Choose an account that will benefit from this allowance. The beneficiary does not have to be a signer of this Safe Account'
    },
    {
      img: '/images/spend-limit-2.webp',
      title: 'Select asset and amount',
      desc: 'You can set allowances for any asset stored in your Safe Account'
    },
    {
      img: '/images/spend-limit-3.webp',
      title: 'Select time',
      desc: 'You can choose to set a one-time allowance or to have it automatically refill after a defined time-period'
    }
  ];

  return (
    <div className='space-y-2.5'>
      <div className='flex items-center gap-2.5'>
        <h6 className='font-bold'>Easy Expense</h6>
        <IconQuestion onClick={toggleAlertOpen} className='cursor-pointer text-foreground/20' />
        <div className='flex-1 text-right'>
          <Button onClick={toggleOpen} radius='full' color='primary' variant='bordered'>
            Add New
          </Button>
        </div>
      </div>

      {address && <Delegates safeAccount={address} />}

      <Modal isOpen={isAlertOpen} onClose={toggleAlertOpen}>
        <ModalContent>
          <ModalHeader>What is Easy Expense?</ModalHeader>
          <ModalBody className='pb-5'>
            <p className='text-tiny'>
              You can set rules for specific beneficiaries to access fundsfrom this Safe Account without having to
              collect all signatures.
            </p>
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
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader className='font-bold'>Set New Easy Expense</ModalHeader>
          <ModalBody>
            <Input
              variant='bordered'
              labelPlacement='outside'
              onChange={setDelegate}
              value={delegate}
              label='Address'
              placeholder='Enter ethereum address'
            />
            <Input
              variant='bordered'
              labelPlacement='outside'
              onChange={setAmount}
              value={amount}
              label={
                <TooltipItem content='Easy Expense users can use these funds without approval within a single Recover Time period.'>
                  Easy Expense Limit
                </TooltipItem>
              }
              placeholder='Enter amount'
            />
            <div>
              <div className='font-bold text-small mb-1.5'>
                <TooltipItem content='You can choose to set a one-time allowance or to have it automatically refill after a defined time-period.'>
                  Reset Time
                </TooltipItem>
              </div>
              <Dropdown placement='bottom-start'>
                <DropdownTrigger>
                  <Button endContent={<ArrowDown />} fullWidth className='justify-between' variant='bordered'>
                    {resetTimes[reset]}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={(key) => setReset(Number(key))}>
                  {Object.entries(resetTimes).map(([key, value]) => (
                    <DropdownItem key={key}>{value}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </ModalBody>
          <ModalFooter>
            <SafeTxButton
              website='mimir://internal/spend-limit'
              isApprove={false}
              isCancel={false}
              address={address}
              buildTx={
                address && isAddress(delegate)
                  ? (_, client) =>
                      buildAddAllowance(
                        client,
                        address,
                        delegate,
                        zeroAddress,
                        parseEther(amount),
                        reset,
                        reset === 0 ? 0 : Math.ceil(dayjs().startOf('hours').valueOf() / 1000 / 60)
                      )
                  : undefined
              }
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

export default React.memo(SpendLimit);
