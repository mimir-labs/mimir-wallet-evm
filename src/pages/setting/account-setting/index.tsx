// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';
import { useContext } from 'react';
import { isAddress } from 'viem';

import { useMultisig, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import Modules from './modules';
import Setup from './Setup';

function AccountSetting() {
  const [tab, setTab] = useQueryParam('accountTab', 'setup', { replace: true });
  const [addressQuery] = useQueryParam<string>('settingAccount');
  const { current } = useContext(AddressContext);

  const safeAddress = addressQuery || current;

  const multisig = useMultisig(safeAddress);

  if (!safeAddress || !isAddress(safeAddress)) return null;

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
      <Tab key='setup' title='Setup'>
        <Setup multisig={multisig} safeAddress={safeAddress} />
      </Tab>
      <Tab key='module' title='Modules'>
        <Modules safeAddress={safeAddress} />
      </Tab>
    </Tabs>
  );
}

export default AccountSetting;
