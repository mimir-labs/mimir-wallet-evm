// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Address from './Address';
import AddressIcon from './AddressIcon';
import AddressName from './AddressName';
import CopyButton from './CopyButton';

interface Props {
  address?: string | null | undefined;
  showFull?: boolean;
  iconSize?: number;
  disableEns?: boolean;
  fallbackName?: React.ReactNode;
  withCopy?: boolean;
}

function AddressCell({ iconSize, address, fallbackName, disableEns, withCopy, showFull }: Props) {
  return (
    <div className='address-cell inline-flex items-center gap-x-2.5 flex-grow-0'>
      <AddressIcon size={iconSize} address={address} />
      <div className='address-cell-content flex flex-col gap-y-1'>
        <div className='inline font-bold text-sm leading-[16px] h-[16px] max-h-[16px] truncate max-w-[90px]'>
          <AddressName address={address} disableEns={disableEns} fallback={fallbackName} />
        </div>
        <div className='inline-flex items-center gap-1 text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal opacity-50'>
          <Address address={address} showFull={showFull} />
          {withCopy && address ? <CopyButton as='div' size='tiny' value={address} color='default' /> : null}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
