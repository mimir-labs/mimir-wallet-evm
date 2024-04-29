// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallDisplayProps } from './types';

import React from 'react';

import { useParseCall } from '@mimir-wallet/hooks';

import FunctionArgs from '../FunctionArgs';
// eslint-disable-next-line import/no-cycle
import Multisend from './Multisend';

function CallDisplay({ data, to }: CallDisplayProps) {
  const [size, parsed] = useParseCall(data);

  if (size === 0) {
    return null;
  }

  if (parsed.functionName === 'multiSend') {
    return <Multisend parsed={parsed} data={data} />;
  }

  return (
    <div className='space-y-3'>
      <FunctionArgs data={data} to={to} />
    </div>
  );
}

export default React.memo(CallDisplay);
