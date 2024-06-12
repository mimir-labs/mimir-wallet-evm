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

  const transfer = (value || 0n) > 0n ? <Transfer key='send-native-token' from={from} to={to} value={value} /> : null;

  const nodes: React.ReactNode[] = [transfer];

  if (parsed.functionName === 'multiSend') {
    nodes.push(<Multisend from={from} parsed={parsed} data={data} />);
  } else if (parsed.functionName === 'transferToken') {
    nodes.push(
      <Transfer
        key='transfer-erc20-token'
        from={from}
        token={parsed.args[0] as Address}
        to={parsed.args[1] as Address}
        value={parsed.args[2] as bigint}
      />
    );
  } else if (parsed.functionName === 'transfer') {
    nodes.push(
      <Transfer
        key='transfer-erc20-token'
        from={from}
        token={to}
        to={parsed.args[0] as Address}
        value={parsed.args[1] as bigint}
      />
    );
  } else if (size !== 0) {
    nodes.push(
      <div className='space-y-3' key='function args'>
        <FunctionArgs data={data} to={to} />
      </div>
    );
  }

  return <div className='space-y-4'>{nodes}</div>;
}

export default React.memo(CallDisplay);
