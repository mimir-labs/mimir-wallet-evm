// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';

import { type AppConfig, apps } from '@mimir-wallet/config';
import { FAVORITE_APP_KEY } from '@mimir-wallet/constants';

import { useLocalStore } from './useStore';

interface UseApps {
  apps: AppConfig[];
  favorites: AppConfig[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
}

export function useApp(website?: string): AppConfig | undefined {
  return useMemo(() => {
    if (website) {
      if (website.startsWith('mimir://')) {
        const app = apps.find((item) => website.startsWith(item.url));

        return app;
      }

      const websiteURL = new URL(website);
      const app = apps.find((item) => {
        const appURL = new URL(item.url);

        return websiteURL.hostname === appURL.hostname;
      });

      return app;
    }

    return undefined;
  }, [website]);
}

const visibleApps = apps.filter((item) => !item.url.startsWith('mimir://internal'));

export function useVisibleApps(): UseApps {
  const [favoriteIds, setFavoriteIds] = useLocalStore<number[]>(FAVORITE_APP_KEY, []);

  const favorites = useMemo(() => visibleApps.filter((item) => favoriteIds?.includes(item.id)), [favoriteIds]);

  const addFavorite = useCallback(
    (id: number) => {
      setFavoriteIds((ids) => {
        const values = Array.from([...ids, id]);

        return values;
      });
    },
    [setFavoriteIds]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      setFavoriteIds((ids) => {
        const values = ids.filter((_id) => _id !== id);

        return values;
      });
    },
    [setFavoriteIds]
  );

  const isFavorite = useCallback((id: number) => !!favoriteIds?.includes(id), [favoriteIds]);

  return useMemo(
    () => ({
      apps: visibleApps,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite
    }),
    [addFavorite, favorites, isFavorite, removeFavorite]
  );
}
