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
  isToken?: boolean;
  icon?: string;
  address?: string | null | undefined;
  showFull?: boolean;
  iconSize?: number;
  disableEns?: boolean;
  fallbackName?: React.ReactNode;
  withCopy?: boolean;
  withExplorer?: boolean;
}

function AddressCell({
  icon,
  isToken,
  iconSize,
  address,
  fallbackName,
  disableEns,
  withCopy,
  withExplorer,
  showFull
}: Props) {
  const [chain] = useChains();

  return (
    <div className='address-cell inline-flex items-center gap-x-2.5 flex-grow-0'>
      <AddressIcon src={icon} isToken={isToken} size={iconSize} address={address} />
      <div className='address-cell-content flex flex-col gap-y-[5px]'>
        <div
          className='inline font-bold text-sm leading-[16px] h-[16px] max-h-[16px] truncate max-w-[90px]'
          style={{ maxWidth: showFull ? '999px' : undefined }}
        >
          <AddressName address={address} disableEns={disableEns} fallback={fallbackName} />
        </div>
        <div className='inline-flex items-center gap-[5px] text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal opacity-50'>
          <Address address={address} showFull={showFull} />
          <span className='inline-flex items-center' style={{ display: withCopy || withExplorer ? undefined : 'none' }}>
            {withCopy && address ? <CopyAddressButton as='div' size='tiny' address={address} color='default' /> : null}
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
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
