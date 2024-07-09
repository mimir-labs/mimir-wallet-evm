// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppCell } from '@mimir-wallet/components';
import { useVisibleApps } from '@mimir-wallet/hooks';

function AppList() {
  const { apps, isFavorite, removeFavorite, addFavorite } = useVisibleApps();

  return (
    <div className='grid grid-cols-12 gap-5'>
      {apps.map((app) => {
        return (
          <div key={app.id} className='col-span-4'>
            <AppCell addFavorite={addFavorite} app={app} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </div>
        );
      })}
    </div>
  );
}

export default AppList;
