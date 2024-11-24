// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppCell } from '@mimir-wallet/components';
import { useVisibleApps } from '@mimir-wallet/hooks';

function AppList() {
  const { apps, isFavorite, removeFavorite, addFavorite } = useVisibleApps();

  return (
    <div className='grid 3xl:grid-cols-5 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid-cols-1 sm:gap-5 gap-4'>
      {apps.map((app) => {
        return (
          <div key={app.id} className='col-span-1'>
            <AppCell addFavorite={addFavorite} app={app} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </div>
        );
      })}
    </div>
  );
}

export default AppList;
