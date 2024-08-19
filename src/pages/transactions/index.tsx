// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Tab, Tabs } from '@nextui-org/react';
import { useContext, useEffect } from 'react';

import { useQueryAccount, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import History from './History';
import Messages from './Messages';
import Pending from './Pending';

function Transaction() {
  const { current, isMultisig } = useContext(AddressContext);
  const [address, setAddress] = useQueryParam<string>('address', undefined, { replace: true });
  const [tab, setTab] = useQueryParam<string>('tab', 'pending', { replace: true });
  const account = useQueryAccount(address as Address);

  useEffect(() => {
    if (!address) {
      if (current && isMultisig(current)) {
        setAddress(current);
      }
    }
  }, [address, current, isMultisig, setAddress]);

  return account ? (
    <Tabs
      color='primary'
      aria-label='Transaction'
      selectedKey={tab}
      onSelectionChange={(key) => setTab(key.toString())}
      classNames={{
        tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
        tabContent: ['text-primary/50', 'font-bold'],
        cursor: ['rounded-medium'],
        panel: ['p-0', 'pt-3']
      }}
    >
      <Tab key='pending' title='Pending'>
        <Pending account={account} />
      </Tab>
      <Tab key='history' title='History'>
        <History account={account} />
      </Tab>
      <Tab key='message' title='Message'>
        <Messages account={account} />
      </Tab>
    </Tabs>
  ) : null;
}

export default Transaction;
