// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';

import { useQueryParam } from '@mimir-wallet/hooks';

import Appearance from './Appearance';
import Notification from './notification';
import RpcSet from './RpcSet';

function GeneralSetting() {
  const [tab, setTab] = useQueryParam('generalTab', 'setup', { replace: true });

  return (
    <Tabs
      color='primary'
      variant='underlined'
      aria-label='Tabs'
      selectedKey={tab}
      onSelectionChange={(key) => setTab(key.toString())}
      classNames={{
        tabContent: ['font-bold'],
        cursor: ['rounded-medium']
      }}
    >
      <Tab key='appearance' title='Appearance'>
        <Appearance />
      </Tab>
      <Tab key='network' title='Network&RPC'>
        <RpcSet />
      </Tab>
      <Tab key='notification' title='Notification'>
        <Notification />
      </Tab>
    </Tabs>
  );
}

export default GeneralSetting;
