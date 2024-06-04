// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAddress } from 'viem';

import { Button } from '@mimir-wallet/components';
import { useMultisig, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import Setup from './Setup';

function AccountSetting() {
  const navigate = useNavigate();
  const [tab, setTab] = useQueryParam('tab', 'setup', { replace: true });
  const { current } = useContext(AddressContext);

  const multisig = useMultisig(current);

  if (!current || !isAddress(current)) return null;

  return (
    <div className='max-w-lg mx-auto space-y-5'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        Back
      </Button>
      <h6 className='font-bold text-xl'>Wallet Setting</h6>
      <Tabs
        color='primary'
        variant='underlined'
        aria-label='Tabs'
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key.toString())}
        classNames={{
          tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
          tabContent: ['text-primary/50', 'font-bold'],
          cursor: ['rounded-medium']
        }}
      >
        <Tab key='setup' title='Setup'>
          <Setup multisig={multisig} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default AccountSetting;
