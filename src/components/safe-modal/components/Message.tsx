// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SafeMessage } from '@mimir-wallet/safe/types';

import React, { useMemo } from 'react';

import CopyButton from '@mimir-wallet/components/CopyButton';

function Message({ message }: { message: SafeMessage }) {
  const title =
    typeof message === 'string' ? (
      <>
        Message: <CopyButton size='tiny' value={message} />
      </>
    ) : (
      message.primaryType
    );

  const content = useMemo(
    () =>
      typeof message === 'string'
        ? message.split('\n').map((msg, index) => (
            <p key={index} className='text-small'>
              {msg}
            </p>
          ))
        : Object.entries(message.message).map(([key, value]) => (
            <div key={key} className='flex justify-between items-center gap-2.5 text-small'>
              <span>{key}</span>
              <span className='font-bold'>{value?.toString?.()}</span>
            </div>
          )),
    [message]
  );

  return (
    <div>
      <h6 className='font-bold text-small flex items-center'>{title}</h6>
      <div className='flex flex-col gap-2.5 bg-secondary rounded-small p-2.5 mt-1.5'>{content}</div>
    </div>
  );
}

export default React.memo(Message);
