// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppCell } from '@mimir-wallet/components';
import { useVisibleApps } from '@mimir-wallet/hooks';

import WalletConnectCell from './WalletConnectCell';

function Apps() {
  const { apps, isFavorite, removeFavorite, addFavorite } = useVisibleApps();

  return (
    <div className='space-y-5'>
      <WalletConnectCell />
      <div className='grid grid-cols-12 gap-5'>
        {apps.map((app) => {
          return (
            <div key={app.id} className='col-span-4'>
              <AppCell addFavorite={addFavorite} app={app} isFavorite={isFavorite} removeFavorite={removeFavorite} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Apps;
