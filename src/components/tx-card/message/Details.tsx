// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageResponse } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { AddressRow, AppName } from '@mimir-wallet/components';
import { generateSafeMessageMessage } from '@mimir-wallet/safe/message';

import { Item } from '../tx-cell/Details';

interface Props {
  message: MessageResponse;
}

function Details({ message }: Props) {
  const safeMessage = useMemo(() => generateSafeMessageMessage(message.mesasge), [message.mesasge]);

  const content = useMemo(
    () =>
      typeof message.mesasge === 'string'
        ? message.mesasge.split('\n').map((msg, index) => (
            <p key={index} className='text-small'>
              {msg}
            </p>
          ))
        : Object.entries(message.mesasge.message).map(([key, value]) => (
            <div key={key} className='flex justify-between items-center gap-2.5 text-small'>
              <span>{key}</span>
              <span className='font-bold'>{value?.toString?.()}</span>
            </div>
          )),
    [message]
  );

  return (
    <div className='flex-1 space-y-2.5'>
      <Item label='Creator' content={<AddressRow address={message.creator} iconSize={16} withCopy />} />
      <Item
        label='App'
        content={<AppName website={message.website} iconUrl={message.iconUrl} appName={message.appName} />}
      />
      <Item
        label='Message'
        center={false}
        content={<div className='bg-secondary p-2.5 rounded-medium space-y-2'>{content}</div>}
      />
      <Item label='Message Hash' content={message.hash} />
      <Item label='SafeMessage' content={safeMessage} />
      <Item label='Create Time' content={dayjs(message.createdAt).format()} />
      <Item label='Update Time' content={dayjs(message.updatedAt).format()} />
    </div>
  );
}

export default React.memo(Details);
