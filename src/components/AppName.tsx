// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';

import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import IconExternal from '@mimir-wallet/assets/svg/icon-external-app.svg?react';
import { useApp } from '@mimir-wallet/hooks';

function AppName({ website, iconSize = 20 }: { website?: string; iconSize?: number }) {
  const app = useApp(website);

  const [name, icon] = useMemo(() => {
    if (website) {
      if (website.startsWith('mimir://')) {
        return app
          ? [app.name, <img alt='mimir' src={app.icon} key={website} style={{ width: iconSize, height: iconSize }} />]
          : ['Mimir', <img alt='mimir' src={LogoCircle} style={{ width: iconSize, height: iconSize }} key={website} />];
      }

      const websiteURL = new URL(website);

      return app
        ? [app.name, <img alt='mimir' src={app.icon} key={website} style={{ width: iconSize, height: iconSize }} />]
        : [
            websiteURL.hostname,
            <IconExternal className='text-primary/50' style={{ width: iconSize, height: iconSize }} key={website} />
          ];
    }

    return [
      'External',
      <IconExternal className='text-primary/50' style={{ width: iconSize, height: iconSize }} key='external' />
    ];
  }, [app, iconSize, website]);

  return (
    <span className='inline-flex items-center gap-x-1'>
      {icon}
      {name}
    </span>
  );
}

export default React.memo(AppName);
