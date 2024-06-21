// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { AddressRow, AppName, Button } from '@mimir-wallet/components';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { AllowanceTransactionResponse } from '@mimir-wallet/hooks/types';
import { formatAgo } from '@mimir-wallet/utils';

interface Props {
  isOpen: boolean;
  transaction: AllowanceTransactionResponse;
  toggleOpen: (value?: unknown) => void;
}

function TimeCell({ time }: { time?: number }) {
  const now = Date.now();

  time ??= now;

  return now - Number(time) < ONE_MINUTE
    ? 'Now'
    : now - Number(time) < ONE_HOUR * 1000
      ? `${formatAgo(Number(time), 'm')} mins ago`
      : now - Number(time) < ONE_DAY * 1000
        ? `${formatAgo(Number(time), 'H')} hours ago`
        : `${formatAgo(Number(time), 'D')} days ago`;
}

function TxItems({ isOpen, toggleOpen, transaction }: Props) {
  return (
    <div className='cursor-pointer h-10 px-3 grid grid-cols-6 gap-2.5' onClick={toggleOpen}>
      <div className='col-span-1 flex items-center'>
        <AppName website='mimir://internal/spend-limit' />
      </div>
      <div className='col-span-1 flex items-center'>{transaction.type}</div>
      <div className='col-span-1 flex items-center text-small'>
        <AddressRow address={transaction.delegate} iconSize={16} />
      </div>
      <div className='col-span-1 flex items-center'>
        <TimeCell time={new Date(transaction.createdAt).valueOf()} />
      </div>
      <div className='col-span-1 flex items-center' />
      <div className='col-span-1 flex items-center justify-between'>
        <div className='space-x-2 flex items-center' />
        <Button
          data-open={isOpen}
          onClick={toggleOpen}
          size='tiny'
          radius='full'
          variant='light'
          isIconOnly
          className='justify-self-end data-[open=true]:rotate-180'
          color='primary'
        >
          <ArrowDown />
        </Button>
      </div>
    </div>
  );
}

export default React.memo(TxItems);
