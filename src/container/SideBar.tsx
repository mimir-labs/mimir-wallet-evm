// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Listbox, ListboxItem } from '@nextui-org/react';
import { useMemo } from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';

import AddressBookSvg from '@mimir-wallet/assets/svg/address-book.svg?react';
import AssetSvg from '@mimir-wallet/assets/svg/asset.svg?react';
import DappSvg from '@mimir-wallet/assets/svg/dapp.svg?react';
import HomeSvg from '@mimir-wallet/assets/svg/home.svg?react';
import RuleSvg from '@mimir-wallet/assets/svg/icon-rule.svg?react';
import SetSvg from '@mimir-wallet/assets/svg/icon-set.svg?react';
import TransactionsSvg from '@mimir-wallet/assets/svg/transactions.svg?react';
import { AccountDrawer } from '@mimir-wallet/components';

import Account from './Account';

const links: { href: string; key: string; icon: React.ReactNode; label: string }[] = [
  {
    href: '/',
    key: 'home',
    icon: <HomeSvg />,
    label: 'Home'
  },
  {
    href: '/assets',
    key: 'assets',
    icon: <AssetSvg />,
    label: 'Assets'
  },
  {
    href: '/apps',
    key: 'apps',
    icon: <DappSvg />,
    label: 'Apps'
  },
  {
    href: '/transactions',
    key: 'transactions',
    icon: <TransactionsSvg />,
    label: 'Transactions'
  },
  {
    href: '/address-book',
    key: 'address-book',
    icon: <AddressBookSvg />,
    label: 'Address Book'
  },
  {
    href: '/rules',
    key: 'rules',
    icon: <RuleSvg />,
    label: 'Rules'
  },
  {
    href: '/setting?tab=general',
    key: 'setting',
    icon: <SetSvg style={{ width: 20, height: 20 }} />,
    label: 'Setting'
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
          { path: '/address-book', key: 'address-book' },
          { path: '/rules', key: 'rules' },
          { path: '/setting', key: 'setting' }
        ],
        location
      )?.map((item) => item.route.key),
    [location]
  );
  const [open, toggleOpen] = useToggle(false);

  return (
    <div className='sticky top-[65px] flex-none w-[232px] h-sidebar-height bg-white border-r-1 border-primary-50 px-4 py-5 space-y-5'>
      <Account handleClick={toggleOpen} />
      <Listbox
        variant='solid'
        color='secondary'
        selectionMode='single'
        selectedKeys={keys}
        className='max-h-[calc(100%-150px)] overflow-y-auto'
        classNames={{
          list: ['space-y-4']
        }}
        itemClasses={{
          selectedIcon: 'hidden',
          base: 'aria-[selected=true]:bg-secondary py-3.5 px-4 opacity-50 aria-[selected=true]:opacity-100 data-[hover=true]:opacity-100',
          title: 'font-bold text-medium'
        }}
      >
        {links.map((item) => (
          <ListboxItem
            className='rounded-medium aria-[selected=true]:text-primary'
            startContent={item.icon}
            key={item.key}
            href={item.href}
          >
            {item.label}
          </ListboxItem>
        ))}
      </Listbox>
      <AccountDrawer isOpen={open} onClose={toggleOpen} />
    </div>
  );
}

export default SideBar;
