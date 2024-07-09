// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';

import { useQueryParam } from '@mimir-wallet/hooks';

import AppList from './AppList';
import CustomApps from './CustomApps';
import WalletConnectCell from './WalletConnectCell';

function Apps() {
  const [tab, setTab] = useQueryParam<string>('tab', 'apps');

  return (
    <div className='space-y-5'>
      <WalletConnectCell />
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
        <Tab key='apps' title='Apps'>
          <AppList />
        </Tab>
        <Tab key='custom' title='Custom Apps'>
          <CustomApps />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Apps;
