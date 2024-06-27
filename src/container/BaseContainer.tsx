// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link, Navbar, NavbarContent } from '@nextui-org/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';

import Logo from '@mimir-wallet/assets/images/logo.png';
import { ButtonEnable, ButtonLinear, MimirLoading, SafeMessageModal, SafeTxModal } from '@mimir-wallet/components';
import { RecoverModal } from '@mimir-wallet/features/delay';
import { AddressContext, SafeTxContext } from '@mimir-wallet/providers';

import BatchButton from './BatchButton';
import Networks from './Networks';
import SideBar from './SideBar';
import WalletConnect from './WalletConnect';

function BaseContainer({
  withSideBar,
  withPadding
}: {
  withSideBar: boolean;
  withPadding: boolean;
}): React.ReactElement {
  const { isReady } = useContext(AddressContext);
  const { state } = useContext(SafeTxContext);
  const { isConnected } = useAccount();

  return (
    <main id='mimir-main' className='bg-main-background min-h-dvh text-foreground text-small'>
      <Navbar maxWidth='full' isBordered className='bg-white'>
        <NavbarContent justify='start' className='w-auto'>
          <Link href='/'>
            <img src={Logo} alt='mimir' className='w-[87px]' />
          </Link>
        </NavbarContent>
        <NavbarContent justify='end' className='text-small w-auto gap-2.5'>
          <BatchButton />
          <WalletConnect />
          {isConnected ? (
            <ConnectButton
              showBalance={{ smallScreen: false, largeScreen: true }}
              chainStatus={{ smallScreen: 'icon', largeScreen: 'icon' }}
            />
          ) : (
            <ButtonEnable Component={ButtonLinear} color='primary' radius='full' withConnect />
          )}
          <Networks />
        </NavbarContent>
      </Navbar>
      {isReady ? (
        <div className='flex'>
          {withSideBar ? <SideBar /> : null}
          <div className={`flex-1 ${withPadding ? 'p-5' : 'p-0'}`}>
            {state.length > 0 ? (
              state[0].type === 'tx' ? (
                <SafeTxModal key={state[0].id} {...state[0].data} />
              ) : (
                <SafeMessageModal key={state[0].id} {...state[0].data} />
              )
            ) : null}

            <RecoverModal />

            <span style={{ display: state.length > 0 ? 'none' : undefined }}>
              <Outlet />
            </span>
          </div>
        </div>
      ) : (
        <div className='absolute left-0 right-0 top-[56px] bottom-0 flex items-center justify-center'>
          <MimirLoading />
        </div>
      )}
    </main>
  );
}

export default BaseContainer;
