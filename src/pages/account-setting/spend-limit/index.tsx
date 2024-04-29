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
import dayjs from 'dayjs';
import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import { isAddress, parseEther, zeroAddress } from 'viem';
import { useChainId } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { Button, ButtonEnable, Input } from '@mimir-wallet/components';
import { deployments } from '@mimir-wallet/config';
import { useInputAddress, useInputNumber, useSafeModuleEnabled } from '@mimir-wallet/hooks';
import { SafeContext } from '@mimir-wallet/providers';
import { buildAddAllowance } from '@mimir-wallet/safe';
import { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import Delegates from './Delegates';

const resetTimes = {
  0: 'Once',
  [60 * 24]: '1 Day',
  [60 * 24 * 7]: '1 Week',
  [60 * 24 * 7 * 30]: '1 Month'
} as const;

function SpendLimit({ address }: { address?: Address }) {
  const { openTxModal } = useContext(SafeContext);
  const chainId = useChainId();
  const allowanceAddress = deployments[chainId].modules.Allowance;
  const isModuleEnabled = useSafeModuleEnabled(address, allowanceAddress);
  const [isOpen, toggleOpen] = useToggle(false);
  const [[delegate], setDelegate] = useInputAddress();
  const [[amount], setAmount] = useInputNumber();
  const [reset, setReset] = useState<number>(0);
  const navigate = useNavigate();

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

  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!address || !isAddress(delegate)) return;

      const safeTx = await buildAddAllowance(
        client,
        address,
        delegate,
        zeroAddress,
        parseEther(amount),
        reset,
        reset === 0 ? 0 : Math.ceil(dayjs().startOf('hours').valueOf() / 1000 / 60)
      );

      toggleOpen(false);
      openTxModal(
        {
          website: 'mimir://internal/spend-limit',
          isApprove: false,
          address,
          safeTx
        },
        () => navigate('/transactions')
      );
    },
    [address, amount, delegate, navigate, openTxModal, reset, toggleOpen]
  );

  return (
    <>
      <Card>
        <CardBody className='p-5 space-y-4'>
          <div className='space-y-2'>
            <h6 className='font-bold text-small'>What is Easy Expense?</h6>
            <p className='text-tiny'>
              You can set rules for specific beneficiaries to access fundsfrom this Safe Account without having to
              collect all signatures.
            </p>
          </div>
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
          {isModuleEnabled && address && <Delegates safeAccount={address} />}
          <Button onClick={toggleOpen} fullWidth radius='full' color='primary'>
            Add Easy Expense
          </Button>
        </CardBody>
      </Card>
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
              label='Easy Expense Limit'
              placeholder='Enter amount'
            />
            <div>
              <div className='font-bold text-small mb-1.5'>Reset Time</div>
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
            <ButtonEnable onClick={handleClick} isToastError fullWidth radius='full' color='primary'>
              Confirm
            </ButtonEnable>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(SpendLimit);
