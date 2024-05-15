// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { CallDisplayProps } from './types';

import React from 'react';

import { useParseCall } from '@mimir-wallet/hooks';

import FunctionArgs from '../FunctionArgs';
// eslint-disable-next-line import/no-cycle
import Multisend from './Multisend';
import Transfer from './Transfer';

function CallDisplay({ data, from, to, value }: CallDisplayProps) {
  const [size, parsed] = useParseCall(data);

  if (size === 0) {
    return <Transfer from={from} to={to} value={value} />;
  }

  if (parsed.functionName === 'multiSend') {
    return <Multisend from={from} parsed={parsed} data={data} />;
  }

  if (parsed.functionName === 'transferToken') {
    return (
      <Transfer
        from={from}
        token={parsed.args[0] as Address}
        to={parsed.args[1] as Address}
        value={parsed.args[2] as bigint}
      />
    );
  }

  if (parsed.functionName === 'transfer') {
    return <Transfer from={from} token={to} to={parsed.args[0] as Address} value={parsed.args[1] as bigint} />;
  }

  return (
    <div className='space-y-3'>
      <FunctionArgs data={data} to={to} />
    </div>
  );
}

export default React.memo(CallDisplay);
