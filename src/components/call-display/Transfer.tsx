// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import React from 'react';
import { zeroAddress } from 'viem';

import { useMediaQuery, useToken } from '@mimir-wallet/hooks';

import AddressIcon from '../AddressIcon';
import AddressName from '../AddressName';
import CopyAddressButton from '../CopyAddressButton';
import FormatBalance from '../FormatBalance';

function AddressDisplay({
  reverse,
  address,
  children
}: {
  reverse: boolean;
  address: Address;
  children: React.ReactNode;
}) {
  const upSm = useMediaQuery('sm');

  return (
    <div
      data-reverse={reverse}
      className='group address-cell inline-flex items-center sm:gap-x-2.5 gap-x-1 flex-grow-0 data-[reverse=true]:flex-row-reverse data-[reverse=true]:text-right'
    >
      <AddressIcon size={upSm ? 24 : 20} address={address} />
      <div className='flex flex-col'>
        <div className='inline-flex items-center font-bold sm:text-sm text-tiny leading-[16px] h-[16px] max-h-[16px] truncate max-w-[120px] gap-1 group-data-[reverse=true]:flex-row-reverse'>
          <AddressName address={address} />
          <CopyAddressButton size='tiny' address={address} color='default' className='text-foreground/50' />
        </div>
        <div className='text-tiny text-foreground/50 leading-[12px]'>{children}</div>
      </div>
    </div>
  );
}

function Transfer({
  from,
  to,
  token = zeroAddress,
  value = 0n
}: {
  from: Address;
  to: Address;
  token?: Address;
  value?: bigint;
}) {
  const [tokenMeta] = useToken(token);
  const upSm = useMediaQuery('sm');

  return (
    <div className='flex items-center justify-between sm:gap-8 gap-2'>
      <AddressDisplay reverse={false} address={from}>
        Sender
      </AddressDisplay>
      <div className='relative flex-1 flex items-center'>
        <div className='w-1.5 h-1.5 rounded-full bg-foreground/50' />
        <div className='flex-1 border-t-1 border-dashed border-foreground/50' />
        <svg width='6' height='8' xmlns='http://www.w3.org/2000/svg' className='text-foreground/50'>
          <polygon points='0,0 6,4 0,8' fill='currentColor' />
        </svg>
        <div className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center sm:px-3 px-1 py-1 gap-1 font-bold sm:text-medium text-tiny leading-none bg-secondary border-1 border-primary/5 rounded-full'>
          <AddressIcon isToken address={token} size={upSm ? 20 : 16} />
          <FormatBalance value={value} {...tokenMeta} showSymbol />
        </div>
      </div>
      <AddressDisplay reverse address={to}>
        Recipient
      </AddressDisplay>
    </div>
  );
}

export default React.memo(Transfer);
