// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Listbox, ListboxItem } from '@nextui-org/react';
import { useMemo } from 'react';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import AddressBookSvg from '@mimir-wallet/assets/svg/address-book.svg?react';
import DappSvg from '@mimir-wallet/assets/svg/dapp.svg?react';
import HomeSvg from '@mimir-wallet/assets/svg/home.svg?react';
import RuleSvg from '@mimir-wallet/assets/svg/icon-rule.svg?react';
import SetSvg from '@mimir-wallet/assets/svg/icon-set.svg?react';
import TransactionsSvg from '@mimir-wallet/assets/svg/transactions.svg?react';
import { AccountDrawer, Drawer } from '@mimir-wallet/components';
import { useMediaQuery } from '@mimir-wallet/hooks';

import Account from './Account';

const links: { href: string; key: string; icon: React.ReactNode; label: string }[] = [
  {
    href: '/',
    key: 'home',
    icon: <HomeSvg />,
    label: 'Home'
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
    href: '/setting',
    key: 'setting',
    icon: <SetSvg style={{ width: 20, height: 20 }} />,
    label: 'Setting'
  }
];

function SideBar({
  offsetTop = 0,
  withSideBar,
  isOpen,
  onClose
}: {
  offsetTop?: number;
  withSideBar: boolean;
  isOpen: boolean;
  onClose: () => void;
}): React.ReactElement {
  const navigate = useNavigate();
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
  const upSm = useMediaQuery('sm');

  const element = (
    <div className='h-full px-4 py-5 sm:space-y-5 space-y-4'>
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
            onClick={() => {
              onClose();
              navigate(item.href);
            }}
          >
            {item.label}
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  );

  return (
    <>
      {!upSm || !withSideBar ? (
        <Drawer rounded placement={upSm ? 'left' : 'right'} isOpen={isOpen} onClose={onClose}>
          {element}
        </Drawer>
      ) : (
        <div
          style={{ top: offsetTop + 65, height: `calc(100dvh - ${offsetTop}px - 1px - var(--nextui-spacing-unit)*16)` }}
          className='sticky flex-none w-[232px] bg-white border-r-1 border-primary-50'
        >
          {element}
        </div>
      )}
      <AccountDrawer
        isOpen={open}
        onClose={() => {
          toggleOpen(false);
          onClose();
        }}
      />
    </>
  );
}

export default SideBar;
