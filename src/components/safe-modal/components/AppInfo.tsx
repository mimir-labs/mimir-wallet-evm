// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@nextui-org/react';
import React from 'react';

import AppName from '@mimir-wallet/components/AppName';

function AppInfo({
  website,
  iconUrl,
  appName
}: {
  website?: string | undefined;
  iconUrl?: string | undefined;
  appName?: string | undefined;
}) {
  return (
    <>
      <div>
        <h6 className='font-bold text-small'>App</h6>
        <div className='flex bg-secondary rounded-small p-2.5 mt-1.5'>
          <AppName website={website} iconSize={24} iconUrl={iconUrl} appName={appName} />
        </div>
      </div>
      {website && (
        <div>
          <h6 className='font-bold text-small'>Website</h6>
          <div className='flex bg-secondary rounded-small p-2.5 mt-1.5'>
            <Link isExternal href={website} className='text-small' showAnchorIcon>
              {website}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(AppInfo);
