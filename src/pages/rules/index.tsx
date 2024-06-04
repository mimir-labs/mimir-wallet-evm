// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { AddressContext } from '@mimir-wallet/providers';

import Recovery from './recovery';
import SpendLimit from './spend-limit';

function Rules() {
  const { current } = useContext(AddressContext);

  return (
    <div className='space-y-5'>
      <Recovery address={current} />
      <SpendLimit address={current} />
    </div>
  );
}

export default Rules;
