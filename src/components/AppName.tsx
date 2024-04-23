// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';

import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import IconExternal from '@mimir-wallet/assets/svg/icon-external-app.svg?react';
import { apps } from '@mimir-wallet/config';

function AppName({ website, iconSize = 20 }: { website?: string; iconSize?: number }) {
  const [name, icon] = useMemo(() => {
    if (website) {
      if (website.startsWith('mimir://')) {
        const app = apps.find((item) => website.startsWith(item.url));

        return app
          ? [app.name, <img alt='mimir' src={app.icon} key={website} style={{ width: iconSize, height: iconSize }} />]
          : ['Mimir', <img alt='mimir' src={LogoCircle} style={{ width: iconSize, height: iconSize }} key={website} />];
      }

      const websiteURL = new URL(website);
      const app = apps.find((item) => {
        const appURL = new URL(item.url);

        return websiteURL.hostname === appURL.hostname;
      });

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
  }, [iconSize, website]);

  return (
    <span className='inline-flex items-center gap-x-1'>
      {icon}
      {name}
    </span>
  );
}

export default React.memo(AppName);
