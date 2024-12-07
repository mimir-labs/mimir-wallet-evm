// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';
import { useContext } from 'react';
import { isAddress } from 'viem';

import { useMultisig, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import Modules from './modules';
import MultiChain from './multi-chain';
import Setup from './Setup';

function AccountSetting() {
  const [tab, setTab] = useQueryParam('accountTab', 'setup', { replace: true });
  const { current: safeAddress } = useContext(AddressContext);

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
      <Tab key='multi-chain' title='Multi-Chain'>
        <MultiChain name={multisig?.name || ''} safeAddress={safeAddress} />
      </Tab>
    </Tabs>
  );
}

export default AccountSetting;
