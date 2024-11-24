// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Tab, Tabs } from '@nextui-org/react';
import React from 'react';

import { useAccountTokens, useMediaQuery, useQueryAccount, useQueryParam, useSafeStats } from '@mimir-wallet/hooks';

import Hero from './Hero';
import Member from './Member';
import Modules from './Modules';
import Nfts from './Nfts';
import Tokens from './Tokens';
import Transaction from './Transaction';

function Dashboard({ address }: { address: Address }) {
  const [data] = useAccountTokens(address);
  const [tab, setTab] = useQueryParam('tab', 'assets', { replace: true });
  const safeAccount = useQueryAccount(address);
  const upSm = useMediaQuery('sm');

  const [stats] = useSafeStats(address);

  return (
    <div className='sm:space-y-5 space-y-3 w-full'>
      <Hero safeAddress={address} totalUsd={data.totalBalanceUsd} />

      <div className='relative sm:space-y-5 space-y-3'>
        <Tabs
          size={upSm ? 'md' : 'sm'}
          color='primary'
          variant='solid'
          aria-label='Tabs'
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key.toString())}
          classNames={{
            tabList: ['max-w-[100%]', 'bg-white', 'shadow-medium', 'rounded-large', 'sm:p-2.5 p-1.5 sm:gap-2.5 gap-1'],
            tab: ['sm:px-3 px-2'],
            tabContent: ['w-full', 'text-primary/50', 'font-bold'],
            cursor: ['rounded-medium'],
            panel: ['w-full']
          }}
        >
          <Tab key='assets' title='Assets'>
            <Tokens address={address} />
          </Tab>
          <Tab key='nfts' title='NFTs'>
            <Nfts address={address} />
          </Tab>
          <Tab key='member' title='Member'>
            <Member safeAccount={safeAccount} />
          </Tab>
          <Tab key='transaction' title='Transaction'>
            <Transaction {...stats} />
          </Tab>
          <Tab key='modules' title='Modules'>
            <Modules safeAddress={address} moduleCounts={stats?.moduleCounts} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default React.memo(Dashboard);
