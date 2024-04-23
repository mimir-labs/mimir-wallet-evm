// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Hex, hexToBytes } from 'viem';

import CopyButton from './CopyButton';

function Bytes({ data }: { data?: Hex }) {
  const size = useMemo(() => hexToBytes(data || '0x').length, [data]);

  return (
    <span className='inline-flex gap-x-1'>
      {size} Bytes
      <CopyButton style={{ color: 'inherit' }} value={data} size='tiny' />
    </span>
  );
}

export default React.memo(Bytes);
