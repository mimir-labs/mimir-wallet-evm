// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconReceive from '@mimir-wallet/assets/svg/icon-receive.svg?react';
import { AddressIcon, Button, FormatBalance } from '@mimir-wallet/components';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useToken } from '@mimir-wallet/hooks';
import { ReceivedResponse } from '@mimir-wallet/hooks/types';
import { formatAgo } from '@mimir-wallet/utils';

interface Props {
  isOpen: boolean;
  transaction: ReceivedResponse;
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
  const [meta] = useToken(transaction.tokenMeta ? undefined : transaction.token);

  return (
    <div className='cursor-pointer h-10 px-3 grid grid-cols-6 gap-2.5' onClick={toggleOpen}>
      <div className='col-span-1 flex items-center'>
        <span className='inline-flex items-center gap-1.5 max-w-full'>
          <IconReceive className='text-success' />
          Receive
        </span>
      </div>
      <div className='col-span-1 flex items-center' />
      <div className='col-span-1 flex items-center text-small gap-1'>
        <FormatBalance prefix='+ ' value={transaction.value} showSymbol={false} {...(transaction.tokenMeta || meta)} />
        <AddressIcon size={20} isToken address={transaction.token} />
        {transaction.tokenMeta?.symbol || meta?.symbol}
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
