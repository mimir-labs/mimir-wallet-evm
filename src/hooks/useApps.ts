// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react';
import store from 'store';

import { type AppConfig, apps } from '@mimir-wallet/config';
import { FAVORITE_APP_KEY } from '@mimir-wallet/constants';
import { events } from '@mimir-wallet/events';

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
  const [favoriteIds, setFavoriteIds] = useState<number[]>(store.get(FAVORITE_APP_KEY) || []);

  const favorites = useMemo(() => visibleApps.filter((item) => favoriteIds?.includes(item.id)), [favoriteIds]);

  const addFavorite = useCallback((id: number) => {
    setFavoriteIds((ids) => {
      const values = Array.from([...ids, id]);

      setTimeout(() => {
        store.set(FAVORITE_APP_KEY, values);
        events.emit('favorite_dapp_added', id);
      });

      return values;
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavoriteIds((ids) => {
      const values = ids.filter((_id) => _id !== id);

      setTimeout(() => {
        store.set(FAVORITE_APP_KEY, values);
        events.emit('favorite_dapp_removed', id);
      });

      return values;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favoriteIds.includes(id), [favoriteIds]);

  useEffect(() => {
    const onChanged = () => {
      setFavoriteIds(store.get(FAVORITE_APP_KEY) || []);
    };

    events.on('favorite_dapp_added', onChanged);
    events.on('favorite_dapp_removed', onChanged);

    return () => {
      events.off('favorite_dapp_added', onChanged);
      events.off('favorite_dapp_removed', onChanged);
    };
  }, []);

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
