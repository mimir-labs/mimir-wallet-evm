// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@nextui-org/react';
import React from 'react';

import { useCurrentChain } from '@mimir-wallet/hooks';
import { explorerUrl } from '@mimir-wallet/utils';

function Hash({ hash, withExplorer }: { hash: string; withExplorer: boolean }) {
  const [, chain] = useCurrentChain();

  if (withExplorer) {
    return (
      <Link
        style={{ fontSize: 'inherit', color: 'inherit', lineHeight: 'inherit' }}
        underline='hover'
        href={explorerUrl('tx', chain, hash)}
        isExternal
        showAnchorIcon
        className='inline [&_svg]:inline'
      >
        {hash}
      </Link>
    );
  }

  return hash;
}

export default React.memo(Hash);
