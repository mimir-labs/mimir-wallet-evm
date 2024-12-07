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
  className?: string;
  chainId?: number;
  address?: string | null | undefined;
  showFull?: boolean;
  iconSize?: number;
  disableEns?: boolean;
  fallbackName?: React.ReactNode;
  withCopy?: boolean;
  withExplorer?: boolean;
  isToken?: boolean;
  thresholdVisible?: boolean;
}

function AddressRow({
  className,
  chainId,
  iconSize,
  thresholdVisible,
  fallbackName,
  address,
  disableEns,
  showFull,
  withCopy,
  withExplorer,
  isToken
}: Props) {
  const chain = useChain(chainId);

  return (
    <div className={`inline-flex items-center gap-x-[5px] ${className || ''}`}>
      <AddressIcon isToken={isToken} size={iconSize} address={address} thresholdVisible={thresholdVisible} />
      <AddressName
        chainId={chainId}
        address={address}
        disableEns={disableEns}
        fallback={fallbackName || <Address chainId={chainId} address={address} showFull={showFull} />}
      />
      <span className='inline-flex items-center' style={{ display: withCopy || withExplorer ? undefined : 'none' }}>
        {withCopy && <CopyAddressButton style={{ color: 'inherit' }} size='tiny' address={address} />}
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
  );
}

export default React.memo(AddressRow);
