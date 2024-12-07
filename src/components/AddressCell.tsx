// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@nextui-org/react';
import React from 'react';

import IconAnchor from '@mimir-wallet/assets/svg/icon-anchor.svg?react';
import { useChain } from '@mimir-wallet/hooks';
import { explorerUrl } from '@mimir-wallet/utils';

import Address from './Address';
import AddressIcon from './AddressIcon';
import AddressName from './AddressName';
import Button from './Button';
import CopyAddressButton from './CopyAddressButton';

interface Props {
  chainId?: number;
  isToken?: boolean;
  disableEip3770?: boolean;
  icon?: string;
  name?: string;
  address?: string | null | undefined;
  showFull?: boolean;
  iconSize?: number;
  disableEns?: boolean;
  fallbackName?: React.ReactNode;
  withCopy?: boolean;
  withExplorer?: boolean;
  replaceAddress?: string;
  className?: string;
}

function AddressCell({
  chainId,
  icon,
  disableEip3770,
  isToken,
  iconSize,
  name,
  address,
  fallbackName,
  disableEns,
  withCopy,
  withExplorer,
  showFull,
  replaceAddress,
  className
}: Props) {
  const chain = useChain(chainId);

  return (
    <div className={`address-cell flex items-center gap-x-2.5 flex-grow-0 ${className}`}>
      <AddressIcon chainId={chainId} src={icon} isToken={isToken} size={iconSize} address={address} />
      <div className='address-cell-content flex flex-col gap-y-[5px]'>
        <div
          className='address-cell-content-name inline font-bold text-sm truncate max-w-[90px] !leading-[1.1]'
          style={{ maxWidth: showFull ? '999px' : undefined }}
        >
          {name || <AddressName chainId={chainId} address={address} disableEns={disableEns} fallback={fallbackName} />}
        </div>
        <div className='address-cell-content-address inline-flex items-center gap-[5px] h-[18px] text-tiny font-normal opacity-50 !leading-[1.1]'>
          {replaceAddress || (
            <Address chainId={chainId} disableEip3770={disableEip3770} address={address} showFull={showFull} />
          )}
          <span className='inline-flex items-center' style={{ display: withCopy || withExplorer ? undefined : 'none' }}>
            {withCopy && address ? <CopyAddressButton as='div' size='tiny' address={address} color='default' /> : null}
            {withExplorer && address && (
              <Button
                size='tiny'
                as={Link}
                target='_blank'
                href={chain ? explorerUrl('address', chain, address) : undefined}
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
