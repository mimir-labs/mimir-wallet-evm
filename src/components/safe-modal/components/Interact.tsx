// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import React from 'react';

import { AddressCell } from '@mimir-wallet/components';
import { useMediaQuery } from '@mimir-wallet/hooks';

function Interact({ address }: { address: Address }) {
  const upSm = useMediaQuery('sm');

  return (
    <div>
      <h6 className='font-bold text-small'>Interact With</h6>
      <div className='flex bg-secondary rounded-small p-2.5 mt-1.5'>
        <AddressCell iconSize={30} address={address} withCopy showFull={upSm} />
      </div>
    </div>
  );
}

export default React.memo(Interact);
