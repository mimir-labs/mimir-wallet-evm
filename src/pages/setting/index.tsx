// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@mimir-wallet/components';
import { useQueryParam } from '@mimir-wallet/hooks';

import AccountSetting from './account-setting';
import GeneralSetting from './general-setting';

function Setting() {
  const navigate = useNavigate();
  const [tab, setTab] = useQueryParam<string>('tab', 'account', { replace: true });

  return (
    <div className='max-w-lg mx-auto flex flex-col gap-y-5 items-start'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        {'<'} Back
      </Button>
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
        <Tab key='account' title='Wallet Setting'>
          <AccountSetting />
        </Tab>
        <Tab key='general' title='General Setting'>
          <GeneralSetting />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Setting;
