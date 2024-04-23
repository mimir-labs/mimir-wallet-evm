// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import jazzicon from '@metamask/jazzicon';
import { Avatar } from '@nextui-org/react';
import React, { useLayoutEffect, useMemo, useRef } from 'react';

interface Props {
  address?: string | null | undefined;
  ensImage?: string | null;
  size?: number;
}

function AddressIcon({ ensImage, size = 24, address }: Props): React.ReactElement {
  const icon = useMemo(() => (address ? jazzicon(size, parseInt(address.slice(2, 10), 16)) : null), [size, address]);
  const iconRef = useRef<HTMLDivElement>(null);

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
  }, [icon, iconRef]);

  return ensImage ? (
    <Avatar src={ensImage} style={{ width: size, height: size }} />
  ) : icon ? (
    <div
      ref={iconRef}
      style={{ width: size, height: size, lineHeight: 1, fontSize: '12px' }}
      className='inline-block [&>div]:rounded-full'
    />
  ) : (
    <Avatar style={{ width: size, height: size }} />
  );
}

export default React.memo(AddressIcon);
