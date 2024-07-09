// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';
import { useChainId } from 'wagmi';

import { type AppConfig, apps } from '@mimir-wallet/config';
import { CUSTOM_APP_KEY, FAVORITE_APP_KEY } from '@mimir-wallet/constants';

import { useLocalStore } from './useStore';

interface UseApps {
  apps: AppConfig[];
  customApps: AppConfig[];
  favorites: AppConfig[];
  isFavorite: (id: string | number) => boolean;
  addFavorite: (id: string | number) => void;
  removeFavorite: (id: string | number) => void;
  addCustom: (app: AppConfig) => void;
  removeCustom: (id: string | number) => void;
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
  const chainId = useChainId();
  const [favoriteIds, setFavoriteIds] = useLocalStore<(number | string)[]>(FAVORITE_APP_KEY, []);
  const [customApps, setCustomApps] = useLocalStore<Record<string | number, AppConfig>>(CUSTOM_APP_KEY, {});

  const addCustom = useCallback(
    (app: AppConfig) => {
      setCustomApps((v) => {
        const lastSupportedChains = v[app.id]?.supportedChains;
        const { supportedChains } = app;

        return {
          ...v,
          [app.id]: {
            ...v[app.id],
            ...app,
            supportedChains: lastSupportedChains
              ? supportedChains
                ? [...lastSupportedChains, ...supportedChains]
                : undefined
              : undefined
          }
        };
      });
    },
    [setCustomApps]
  );

  const removeCustom = useCallback(
    (id: string | number) => {
      setCustomApps((v) => {
        const newV = { ...v };

        delete v[id];

        return newV;
      });
    },
    [setCustomApps]
  );

  const customAppsArr = useMemo(() => Object.values(customApps), [customApps]);

  const supportedApps = useMemo(
    () => visibleApps.filter((item) => (item.supportedChains ? item.supportedChains.includes(chainId) : true)),
    [chainId]
  );
  const favorites = useMemo(
    () => supportedApps.concat(customAppsArr).filter((item) => favoriteIds?.includes(item.id)),
    [customAppsArr, favoriteIds, supportedApps]
  );

  const addFavorite = useCallback(
    (id: number | string) => {
      setFavoriteIds((ids) => {
        const values = Array.from([...ids, id]);

        return values;
      });
    },
    [setFavoriteIds]
  );

  const removeFavorite = useCallback(
    (id: number | string) => {
      setFavoriteIds((ids) => {
        const values = ids.filter((_id) => _id !== id);

        return values;
      });
    },
    [setFavoriteIds]
  );

  const isFavorite = useCallback((id: number | string) => !!favoriteIds?.includes(id), [favoriteIds]);

  return useMemo(
    () => ({
      apps: supportedApps,
      customApps: customAppsArr,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      addCustom,
      removeCustom
    }),
    [addCustom, addFavorite, customAppsArr, favorites, isFavorite, removeCustom, removeFavorite, supportedApps]
  );
}
