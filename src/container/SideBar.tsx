// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Listbox, ListboxItem } from '@nextui-org/react';
import { useMemo } from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import AddressBookSvg from '@mimir-wallet/assets/svg/address-book.svg?react';
import AddressBookSelectedSvg from '@mimir-wallet/assets/svg/address-book-selected.svg?react';
import AssetSvg from '@mimir-wallet/assets/svg/asset.svg?react';
import AssetSelectedSvg from '@mimir-wallet/assets/svg/asset-selected.svg?react';
import DappSvg from '@mimir-wallet/assets/svg/dapp.svg?react';
import DappSelectedSvg from '@mimir-wallet/assets/svg/dapp-selected.svg?react';
import HomeSvg from '@mimir-wallet/assets/svg/home.svg?react';
import HomeSelectedSvg from '@mimir-wallet/assets/svg/home-selected.svg?react';
import TransactionsSvg from '@mimir-wallet/assets/svg/transactions.svg?react';
import TransactionsSelectedSvg from '@mimir-wallet/assets/svg/transactions-selected.svg?react';

const links: { href: string; key: string; icon: React.ReactNode; selectedIcon: React.ReactNode; label: string }[] = [
  {
    href: '/',
    key: 'home',
    icon: <HomeSvg />,
    selectedIcon: <HomeSelectedSvg />,
    label: 'Home'
  },
  {
    href: '/assets',
    key: 'assets',
    icon: <AssetSvg />,
    selectedIcon: <AssetSelectedSvg />,
    label: 'Assets'
  },
  {
    href: '/apps',
    key: 'apps',
    icon: <DappSvg />,
    selectedIcon: <DappSelectedSvg />,
    label: 'Apps'
  },
  {
    href: '/transactions',
    key: 'transactions',
    icon: <TransactionsSvg />,
    selectedIcon: <TransactionsSelectedSvg />,
    label: 'Transactions'
  },
  {
    href: '/address-book',
    key: 'address-book',
    icon: <AddressBookSvg />,
    selectedIcon: <AddressBookSelectedSvg />,
    label: 'Address Book'
  }
];

function SideBar(): React.ReactElement {
  const location = useLocation();
  const keys = useMemo(
    () =>
      matchRoutes(
        [
          { path: '/', key: 'home' },
          { path: '/assets', key: 'assets' },
          { path: '/apps', key: 'apps' },
          { path: '/transactions', key: 'transactions' },
          { path: '/address-book', key: 'address-book' }
        ],
        location
      )?.map((item) => item.route.key),
    [location]
  );

  return (
    <div className='flex-none w-[200px] h-sidebar-height bg-white border-r-1 border-primary-50 px-4 py-5'>
      <Listbox
        variant='solid'
        color='secondary'
        selectionMode='single'
        selectedKeys={keys}
        classNames={{
          list: 'space-y-5'
        }}
        itemClasses={{
          selectedIcon: 'hidden',
          base: 'data-[selected=true]:bg-secondary py-4 px-5 opacity-50 data-[selected=true]:opacity-100 data-[hover=true]:opacity-100',
          title: 'font-bold text-medium'
        }}
      >
        {links.map((item) => (
          <ListboxItem startContent={keys?.includes(item.key) ? item.selectedIcon : item.icon} key={item.key} href={item.href}>
            {item.label}
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  );
}

export default SideBar;
