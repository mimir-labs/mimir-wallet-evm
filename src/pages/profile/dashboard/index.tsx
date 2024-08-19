// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Tab, Tabs } from '@nextui-org/react';
import React from 'react';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/components';
import { useAccountTokens, useQueryAccount, useQueryParam, useSafeStats } from '@mimir-wallet/hooks';

import AddToken from './AddToken';
import Hero from './Hero';
import Member from './Member';
import Modules from './Modules';
import Nfts from './Nfts';
import Tokens from './Tokens';
import Transaction from './Transaction';

function Dashboard({ address }: { address: Address }) {
  const [data] = useAccountTokens(address);
  const [tab, setTab] = useQueryParam('tab', 'assets', { replace: true });
  const [isOpen, toggleOpen] = useToggle(false);
  const safeAccount = useQueryAccount(address);

  const [stats] = useSafeStats(address);

  return (
    <>
      <div className='space-y-5'>
        <Hero safeAddress={address} totalUsd={data.totalBalanceUsd} />

        <div className='relative space-y-5'>
          <div className='absolute right-0 top-8'>
            {tab === 'assets' && (
              <Button onClick={toggleOpen} radius='full' color='primary'>
                Add
              </Button>
            )}
          </div>

          <Tabs
            color='primary'
            variant='solid'
            aria-label='Tabs'
            selectedKey={tab}
            onSelectionChange={(key) => setTab(key.toString())}
            classNames={{
              tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
              tabContent: ['text-primary/50', 'font-bold'],
              cursor: ['rounded-medium']
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

      <AddToken isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default React.memo(Dashboard);
