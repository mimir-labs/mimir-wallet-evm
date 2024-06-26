// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash } from 'viem';

import { Divider } from '@nextui-org/react';
import React from 'react';

import { CallDisplay } from '@mimir-wallet/components';

interface Props {
  from: Address;
  data: Hash;
  to: Address;
  value: bigint;
  children: React.ReactNode;
}

export function Item({
  label,
  content,
  center = true
}: {
  label: React.ReactNode;
  content: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className='grid grid-cols-10 text-tiny'>
      <div data-center={center} className='col-span-3 font-bold data-[center=true]:self-center tex-foreground'>
        {label}
      </div>
      <div className='col-span-7 self-center text-foreground/50'>{content}</div>
    </div>
  );
}

function Details({ from, data, to, value, children }: Props) {
  return (
    <div className='flex-1 space-y-2.5'>
      <CallDisplay from={from} data={data} to={to} value={value} />
      <Divider />
      {children}
    </div>
  );
}

export default React.memo(Details);
