// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash } from 'viem';

import { Divider } from '@nextui-org/react';
import React from 'react';

import { CallDisplay } from '@mimir-wallet/components';

interface Props {
  data: Hash;
  to?: Address;
  value: bigint;
  children: React.ReactNode;
}

export function Item({ label, content }: { label: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className='grid grid-cols-10 text-tiny'>
      <div className='col-span-3 font-bold self-center tex-foreground'>{label}</div>
      <div className='col-span-7 self-center text-foreground/50'>{content}</div>
    </div>
  );
}

function Details({ data, to, value, children }: Props) {
  return (
    <div className='flex-1 space-y-2'>
      <CallDisplay data={data} to={to} value={value} />
      <Divider />
      {children}
    </div>
  );
}

export default React.memo(Details);
