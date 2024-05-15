// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import jazzicon from '@metamask/jazzicon';
import { Avatar } from '@nextui-org/react';
import React, { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { zeroAddress } from 'viem';
import { useChainId } from 'wagmi';

import { AddressContext } from '@mimir-wallet/providers';

interface Props {
  address?: string | null | undefined;
  ensImage?: string | null;
  size?: number;
  src?: string;
  isToken?: boolean;
}

function AddressIcon({ ensImage, size = 24, src, isToken, address }: Props): React.ReactElement {
  if (isToken) {
    address ||= zeroAddress;
  }

  const { addressIcons } = useContext(AddressContext);
  const icon = useMemo(() => (address ? jazzicon(size, parseInt(address.slice(2, 10), 16)) : null), [size, address]);
  const iconRef = useRef<HTMLDivElement>(null);
  const chainId = useChainId();

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
        iconSrc = `/chain-icons/${chainId}.webp`;
      }
    } else {
      iconSrc = addressIcons?.[chainId]?.[address];
    }
  }

  return (
    <Avatar
      src={iconSrc || undefined}
      style={{ width: size, height: size }}
      fallback={
        <div
          ref={iconRef}
          style={{ width: size, height: size, lineHeight: 1, fontSize: '12px' }}
          className='inline-block [&>div]:rounded-full'
        />
      }
    />
  );
}

export default React.memo(AddressIcon);
