// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Hash } from 'viem';

import React from 'react';

function Item({ label, content }: { label: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className='grid grid-cols-10 text-tiny'>
      <div className='col-span-3 font-bold self-center tex-foreground'>{label}</div>
      <div className='col-span-7 self-center text-foreground/50 max-w-full overflow-hidden text-ellipsis'>
        {content}
      </div>
    </div>
  );
}

function MessageDetails({ hash, safeMessage }: { hash: Hash; safeMessage: Hash }) {
  return (
    <div>
      <h6 className='font-bold text-small flex items-center'>SafeMessage Details</h6>
      <div className='flex flex-col gap-2.5 bg-secondary rounded-small p-2.5 mt-1.5'>
        <Item label='SafeMessage' content={safeMessage} />
        <Item label='SafeMessage Hash' content={hash} />
      </div>
    </div>
  );
}

export default React.memo(MessageDetails);
