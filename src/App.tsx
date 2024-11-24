// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Config } from 'wagmi';

import { useRef } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

import BaseContainer from './container/BaseContainer';
import PageAddressBook from './pages/address-book';
import PageApps from './pages/apps';
import PageAppExplorer from './pages/apps/app-explorer';
// import PageAssets from './pages/assets';
import PageCreateMultisig from './pages/create-multisig';
import PageImportMultisig from './pages/import-multisig';
import PageProfile from './pages/profile';
import PageWelcome from './pages/profile/Welcome';
import PageReset from './pages/reset';
import PageRules from './pages/rules';
import PageSetting from './pages/setting';
import PageTransactions from './pages/transactions';
import Providers from './providers/providers';

function App({
  address,
  config,
  refetchInterval
}: {
  address?: Address;
  config: Config;
  refetchInterval?: number;
}): React.ReactElement {
  const router = useRef(
    createBrowserRouter([
      {
        element: (
          <Providers address={address} config={config} refetchInterval={refetchInterval}>
            <Outlet />
          </Providers>
        ),
        children: [
          {
            element: <BaseContainer auth withSideBar withPadding />,
            children: [
              {
                index: true,
                element: <PageProfile />
              },
              {
                path: '/apps',
                element: <PageApps />
              },
              {
                path: '/transactions',
                element: <PageTransactions />
              },
              {
                path: '/address-book',
                element: <PageAddressBook />
              },
              {
                path: '/setting',
                element: <PageSetting />
              },
              {
                path: '/rules',
                element: <PageRules />
              },
              {
                path: '/reset/:delayAddress',
                element: <PageReset />
              }
            ]
          },
          {
            element: <BaseContainer auth={false} withSideBar={false} withPadding />,
            children: [
              {
                path: '/create-multisig',
                element: <PageCreateMultisig />
              },
              {
                path: '/import-multisig',
                element: <PageImportMultisig />
              }
            ]
          },
          {
            element: <BaseContainer auth withSideBar={false} withPadding={false} />,
            children: [
              {
                path: '/apps/:url',
                element: <PageAppExplorer />
              }
            ]
          },
          {
            element: <BaseContainer auth={false} withSideBar withPadding />,
            children: [
              {
                path: '/welcome',
                element: <PageWelcome />
              }
            ]
          }
        ]
      },
      {
        path: '/assets',
        element: <Navigate to='/' replace />
      },
      {
        path: '*',
        element: <Navigate replace to='/' />
      }
    ])
  );

  return <RouterProvider router={router.current} />;
}

export default App;
