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

function AddressRow({ iconSize, fallbackName, address, disableEns, showFull, withCopy }: Props) {
  return (
    <div className='inline-flex items-center gap-x-1'>
      <AddressIcon size={iconSize} address={address} />
      <AddressName
        address={address}
        disableEns={disableEns}
        fallback={fallbackName || <Address address={address} showFull={showFull} />}
      />
      {withCopy && <CopyButton style={{ color: 'inherit' }} size='tiny' value={address} />}
    </div>
  );
}

export default React.memo(AddressRow);
