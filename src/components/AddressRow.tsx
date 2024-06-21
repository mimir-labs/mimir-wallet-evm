// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@nextui-org/react';
import React from 'react';
import { useChains } from 'wagmi';

import IconAnchor from '@mimir-wallet/assets/svg/icon-anchor.svg?react';
import { explorerUrl } from '@mimir-wallet/utils';

import Address from './Address';
import AddressIcon from './AddressIcon';
import AddressName from './AddressName';
import Button from './Button';
import CopyAddressButton from './CopyAddressButton';

interface Props {
  address?: string | null | undefined;
  showFull?: boolean;
  iconSize?: number;
  disableEns?: boolean;
  fallbackName?: React.ReactNode;
  withCopy?: boolean;
  withExplorer?: boolean;
  isToken?: boolean;
}

function AddressRow({ iconSize, fallbackName, address, disableEns, showFull, withCopy, withExplorer, isToken }: Props) {
  const [chain] = useChains();

  return (
    <div className='inline-flex items-center gap-x-[5px]'>
      <AddressIcon isToken={isToken} size={iconSize} address={address} />
      <AddressName
        address={address}
        disableEns={disableEns}
        fallback={fallbackName || <Address address={address} showFull={showFull} />}
      />
      <span className='inline-flex items-center' style={{ display: withCopy || withExplorer ? undefined : 'none' }}>
        {withCopy && <CopyAddressButton style={{ color: 'inherit' }} size='tiny' address={address} />}
        {withExplorer && address && (
          <Button
            size='tiny'
            as={Link}
            target='_blank'
            href={explorerUrl('address', chain, address)}
            isIconOnly
            variant='light'
            style={{ color: 'inherit' }}
          >
            <IconAnchor style={{ width: 12, height: 12 }} />
          </Button>
        )}
      </span>
    </div>
  );
}

export default React.memo(AddressRow);
