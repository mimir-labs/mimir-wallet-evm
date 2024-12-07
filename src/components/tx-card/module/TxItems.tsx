// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetaTransaction } from '@mimir-wallet/safe/types';

import React from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { Button, CallDetails, FormatBalance } from '@mimir-wallet/components';
import { moduleDeployments } from '@mimir-wallet/config';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useDelayAddress } from '@mimir-wallet/features/delay';
import { useCurrentChain } from '@mimir-wallet/hooks';
import { CallFunctions, ModuleTransactionResponse, ParsedCall } from '@mimir-wallet/hooks/types';
import { formatAgo } from '@mimir-wallet/utils';

interface Props {
  isOpen: boolean;
  dataSize: number;
  transaction: ModuleTransactionResponse;
  parsed: ParsedCall<CallFunctions>;
  multisend?: MetaTransaction[] | null;
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

function TxItems({ multisend, isOpen, toggleOpen, dataSize, parsed, transaction }: Props) {
  const [, chain] = useCurrentChain();
  const modules = moduleDeployments[chain.id].Allowance;
  const [delays] = useDelayAddress(transaction.address);

  return (
    <div className='cursor-pointer h-10 px-3 grid sm:grid-cols-6 grid-cols-7' onClick={toggleOpen}>
      <div className='sm:col-span-1 col-span-4 flex items-center gap-1.5'>
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
          <circle cx='10' cy='10' r='10' fill='#2700FF' />
          <path
            d='M8.75 9.6875H5.9375C5.4375 9.6875 5 9.25 5 8.75V5.9375C5 5.4375 5.4375 5 5.9375 5H8.75C9.25 5 9.6875 5.4375 9.6875 5.9375V8.75C9.6875 9.25 9.25 9.6875 8.75 9.6875ZM8.75 15H5.9375C5.4375 15 5 14.5625 5 14.0625V11.25C5 10.75 5.4375 10.3125 5.9375 10.3125H8.75C9.25 10.3125 9.6875 10.75 9.6875 11.25V14C9.6875 14.5625 9.25 15 8.75 15ZM12.6875 15C11.375 15 10.3125 13.9375 10.3125 12.6875C10.3125 11.375 11.375 10.375 12.625 10.375C13.9375 10.375 14.9375 11.4375 14.9375 12.6875C15 13.9375 13.9375 15 12.6875 15ZM14.0625 9.6875H11.25C10.75 9.6875 10.3125 9.25 10.3125 8.75V5.9375C10.3125 5.4375 10.75 5 11.25 5H14C14.5625 5 15 5.4375 15 5.9375V8.75C15 9.25 14.5625 9.6875 14.0625 9.6875Z'
            fill='white'
          />
        </svg>
        {modules.includes(transaction.module)
          ? 'Easy Expense Module'
          : delays.map((item) => item.address).includes(transaction.module)
            ? 'Recovery Module'
            : 'Module Transaction'}
      </div>
      <div className='sm:col-span-1 col-span-2 flex items-center'>{parsed.functionName}</div>
      <div className='col-span-1 sm:flex hidden items-center text-small'>
        {dataSize ? (
          <CallDetails multisend={multisend} parsed={parsed} />
        ) : (
          <FormatBalance
            prefix='- '
            value={transaction.value}
            decimals={chain.nativeCurrency.decimals}
            showSymbol
            symbol={chain.nativeCurrency.symbol}
          />
        )}
      </div>
      <div className='col-span-1 sm:flex hidden items-center'>
        <TimeCell time={new Date(transaction.createdAt).valueOf()} />
      </div>
      <div className='col-span-1 sm:flex hidden items-center' />
      <div className='col-auto flex items-center justify-between'>
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
