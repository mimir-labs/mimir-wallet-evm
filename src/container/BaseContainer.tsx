// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link, Navbar, NavbarContent } from '@nextui-org/react';
import { Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';

import Logo from '@mimir-wallet/assets/images/logo.png';
import { ButtonEnable, ButtonLinear } from '@mimir-wallet/components';

import SideBar from './SideBar';

function BaseContainer({ withSideBar }: { withSideBar: boolean }): React.ReactElement {
  const { isConnected } = useAccount();

  return (
    <main id='mimir-main' className='bg-main-background h-dvh text-foreground text-small'>
      <Navbar maxWidth='full' position='sticky' isBordered className='bg-white'>
        <NavbarContent justify='start' className='w-auto'>
          <Link href='/'>
            <img src={Logo} alt='mimir' className='w-[87px]' />
          </Link>
        </NavbarContent>
        <NavbarContent justify='end' className='text-small w-auto'>
          {isConnected ? <w3m-button /> : <ButtonEnable Component={ButtonLinear} radius='full' />}
        </NavbarContent>
      </Navbar>
      <div className='flex'>
        {withSideBar ? <SideBar /> : null}
        <div className='flex-1 p-5'>
          <Outlet />
        </div>
      </div>
    </main>
  );
}

export default BaseContainer;
