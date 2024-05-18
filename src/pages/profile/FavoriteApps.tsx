// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppConfig } from '@mimir-wallet/config';

import { AppCell } from '@mimir-wallet/components';

function FavoriteApps({
  favorites,
  isFavorite,
  addFavorite,
  removeFavorite
}: {
  favorites: AppConfig[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
}) {
  return (
    <div className='grid grid-cols-12 gap-5'>
      {favorites.map((app) => {
        return (
          <div key={app.id} className='col-span-4'>
            <AppCell addFavorite={addFavorite} app={app} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </div>
        );
      })}
    </div>
  );
}

export default FavoriteApps;
