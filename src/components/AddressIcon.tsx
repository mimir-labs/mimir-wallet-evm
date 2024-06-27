// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import jazzicon from '@metamask/jazzicon';
import { Avatar } from '@nextui-org/react';
import React, { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { zeroAddress } from 'viem';
import { useChainId, useChains } from 'wagmi';

import { CustomChain } from '@mimir-wallet/config';
import { AddressContext } from '@mimir-wallet/providers';

import AddressIconJazz from './AddressIconJazz';

interface Props {
  address?: string | null | undefined;
  ensImage?: string | null;
  size?: number;
  src?: string;
  thresholdVisible?: boolean;
  isToken?: boolean;
}

function AddressIcon({
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

  const { addressIcons, addressThresholds } = useContext(AddressContext);
  const icon = useMemo(() => (address ? jazzicon(size, parseInt(address.slice(2, 10), 16)) : null), [size, address]);
  const iconRef = useRef<HTMLDivElement>(null);
  const chainId = useChainId();
  const [chain] = useChains();

  const threshold = address ? addressThresholds?.[address] : undefined;

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
    } else {
      iconSrc = addressIcons?.[chainId]?.[address];
    }
  }

  return (
    <span className='relative'>
      <Avatar
        src={iconSrc || undefined}
        style={{ width: size, height: size }}
        fallback={<AddressIconJazz address={address} size={size} ensImage={ensImage} />}
      />
      {thresholdVisible && size >= 20 && threshold && (
        <span className='absolute left-0 right-0 bottom-0 w-full flex items-center justify-center overflow-visible'>
          <span className='flex-1 flex items-center justify-center font-bold text-tiny rounded-full bg-primary text-primary-foreground whitespace-nowrap translate-y-[40%]'>
            <span className='scale-85 origin-center'>{threshold.join('/')}</span>
          </span>
        </span>
      )}
    </span>
  );
}

export default React.memo(AddressIcon);
