// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar } from '@nextui-org/react';
import React, { useMemo } from 'react';

import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import IconExternal from '@mimir-wallet/assets/svg/icon-external-app.svg?react';
import { useApp } from '@mimir-wallet/hooks';

function AppName({
  website,
  iconSize = 20,
  iconUrl,
  appName
}: {
  website?: string;
  iconSize?: number;
  iconUrl?: string;
  appName?: string;
}) {
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
            appName || websiteURL.hostname,
            iconUrl ? (
              <Avatar src={iconUrl} style={{ width: iconSize, height: iconSize }} />
            ) : (
              <IconExternal className='text-primary/50' style={{ width: iconSize, height: iconSize }} key={website} />
            )
          ];
    }

    return [
      'External',
      <IconExternal className='text-primary/50' style={{ width: iconSize, height: iconSize }} key='external' />
    ];
  }, [app, appName, iconSize, iconUrl, website]);

  return (
    <span className='inline-flex items-center gap-1.5 max-w-full'>
      <span className='flex-shrink-0'>{icon}</span>
      <span className='flex-grow overflow-hidden whitespace-nowrap text-ellipsis'>{name}</span>
    </span>
  );
}

export default React.memo(AppName);
