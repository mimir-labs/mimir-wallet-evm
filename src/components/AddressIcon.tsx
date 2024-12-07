// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import jazzicon from '@metamask/jazzicon';
import { Avatar } from '@nextui-org/react';
import React, { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { zeroAddress } from 'viem';

import { CustomChain } from '@mimir-wallet/config';
import { useChain, useCurrentChain, useThresholds } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import AddressIconJazz from './AddressIconJazz';

interface Props {
  chainId?: number;
  address?: string | null | undefined;
  ensImage?: string | null;
  size?: number;
  src?: string;
  thresholdVisible?: boolean;
  isToken?: boolean;
}

function AddressIcon({
  chainId: propsChainId,
  ensImage,
  size = 24,
  thresholdVisible = true,
  src,
  isToken,
  address
}: Props): React.ReactElement {
  if (isToken) {
    address ||= zeroAddress;
  }

  const [chainId] = useCurrentChain();
  const { addressIcons } = useContext(AddressContext);
  const icon = useMemo(() => (address ? jazzicon(size, parseInt(address.slice(2, 10), 16)) : null), [size, address]);
  const iconRef = useRef<HTMLDivElement>(null);
  const chain = useChain(propsChainId || chainId);
  const thresholds = useThresholds(propsChainId || chainId, thresholdVisible ? address : null);

  useLayoutEffect(() => {
    const { current } = iconRef;

    if (icon) {
      current?.appendChild(icon);

      return () => {
        try {
          current?.removeChild(icon);
        } catch {
          /* empty */
        }
      };
    }

    return () => 0;
  }, [icon]);

  let iconSrc = src || ensImage;

  if (address) {
    if (address === zeroAddress) {
      if (isToken) {
        iconSrc = (chain as CustomChain).nativeCurrencyIcon;
      }
    } else if (chain) {
      iconSrc ||= addressIcons?.[chain.id]?.[address];
    }
  }

  return (
    <span
      className='relative'
      style={{
        width: size,
        height: size + (thresholdVisible && thresholds ? 6 + size / 16 : 0)
      }}
    >
      <Avatar
        src={iconSrc || undefined}
        style={{ width: size, height: size, background: 'transparent' }}
        fallback={<AddressIconJazz address={address} size={size} ensImage={ensImage} />}
      />
      {thresholdVisible && thresholds && (
        <span
          className='absolute left-0 right-0 bottom-0 w-full flex items-center justify-center overflow-visible bg-primary text-primary-foreground'
          style={{
            fontSize: size / 3,
            height: Math.max(12, size / 2.5),
            borderRadius: `${Math.max(12, size / 2.5) / 2}px`
          }}
        >
          {thresholds.join('/')}
        </span>
      )}
    </span>
  );
}

export default React.memo(AddressIcon);
