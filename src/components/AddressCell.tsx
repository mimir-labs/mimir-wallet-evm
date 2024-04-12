// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Address from './Address';
import AddressIcon from './AddressIcon';
import AddressName from './AddressName';

interface Props {
  address?: string | null | undefined;
  showFull?: boolean;
  iconSize?: number;
  disableEns?: boolean;
  fallbackName?: React.ReactNode;
}

function AddressCell({ iconSize, address, fallbackName, disableEns, showFull }: Props) {
  return (
    <div className='inline-flex items-center gap-x-2.5'>
      <AddressIcon size={iconSize} address={address} />
      <div className='flex flex-col gap-1'>
        <div className='font-bold text-sm'>
          <AddressName address={address} disableEns={disableEns} fallback={fallbackName} />
        </div>
        <div className='text-tiny'>
          <Address address={address} showFull={showFull} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
