// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link, Navbar, NavbarContent } from '@nextui-org/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useAccount } from 'wagmi';

import Logo from '@mimir-wallet/assets/images/logo.png';
import IconMenu from '@mimir-wallet/assets/svg/icon-menu.svg?react';
import {
  Button,
  ButtonEnable,
  ButtonLinear,
  MimirLoading,
  SafeMessageModal,
  SafeTxModal
} from '@mimir-wallet/components';
import { RecoverModal } from '@mimir-wallet/features/delay';
import { useFollowAccounts, useIsReadOnly, useMediaQuery, useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext, SafeTxContext } from '@mimir-wallet/providers';

import BatchButton from './BatchButton';
import Networks from './Networks';
import ReadOnlyAlert from './ReadOnlyAlert';
import SideBar from './SideBar';
import WalletConnect from './WalletConnect';

function BaseContainer({
  auth,
  withSideBar,
  withPadding
}: {
  auth: boolean;
  withSideBar: boolean;
  withPadding: boolean;
}): React.ReactElement {
  const { isReady, current, watchlist } = useContext(AddressContext);
  const { state } = useContext(SafeTxContext);
  const { isConnected } = useAccount();
  const safeAccount = useQueryAccount(current);
  const isReadOnly = useIsReadOnly(safeAccount);
  const [isSidebarOpen, toggleSidebar] = useToggle(false);
  const upSm = useMediaQuery('sm');

  useFollowAccounts();

  const showWatchOnlyAlert =
    isReadOnly && safeAccount && safeAccount.type === 'safe' && !watchlist[safeAccount.address];

  if (!current && auth) {
    return <Navigate to='/welcome' replace />;
  }

  return (
    <main id='mimir-main' className='bg-main-background min-h-dvh text-foreground text-small'>
      <Navbar maxWidth='full' isBordered classNames={{ base: ['sm:px-5 px-3'], wrapper: ['px-0'] }}>
        {upSm && (
          <NavbarContent justify='start' className='w-auto'>
            <Link href='/'>
              <img src={Logo} alt='mimir' className='w-[87px]' />
            </Link>
          </NavbarContent>
        )}
        <NavbarContent justify='end' className='text-small w-auto sm:gap-2.5 gap-2'>
          {current && <BatchButton address={current} />}
          {current && <WalletConnect />}

          {isConnected ? (
            <ConnectButton
              showBalance={{ smallScreen: false, largeScreen: true }}
              chainStatus='none'
              accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
            />
          ) : (
            <ButtonEnable Component={ButtonLinear} color='primary' radius='full' withConnect />
          )}

          <Networks />

          <Button variant='light' isIconOnly className='sm:hidden flex' color='primary' onClick={toggleSidebar}>
            <IconMenu />
          </Button>
        </NavbarContent>
      </Navbar>
      {showWatchOnlyAlert && <ReadOnlyAlert safeAddress={safeAccount.address} />}
      {isReady ? (
        <div
          className='flex'
          style={{
            width: '100%',
            minHeight: `calc(100dvh - ${showWatchOnlyAlert ? 37 : 0}px - 1px - var(--nextui-spacing-unit)*16)`
          }}
        >
          <SideBar
            withSideBar={withSideBar}
            isOpen={isSidebarOpen}
            onClose={() => toggleSidebar(false)}
            offsetTop={showWatchOnlyAlert ? 37 : 0}
          />

          <RecoverModal />

          <div
            className={`w-full flex-1 sm:p-${withPadding ? 5 : 0} p-${withPadding ? 4 : 0}`}
            style={{ display: state.length > 0 ? 'none' : undefined }}
          >
            <Outlet />
          </div>

          {state.length > 0 ? (
            <div className='w-full flex-1 sm:p-5 p-4'>
              {state[0].type === 'tx' ? (
                <SafeTxModal key={state[0].id} {...state[0].data} />
              ) : (
                <SafeMessageModal key={state[0].id} {...state[0].data} />
              )}
            </div>
          ) : null}
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
