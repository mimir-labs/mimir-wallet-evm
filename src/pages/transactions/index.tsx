// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Tab, Tabs } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo } from 'react';
import { useChainId } from 'wagmi';

import { SafeTxCard } from '@mimir-wallet/components';
import { TransactionItem, useHistoryTransactions, useQueryAccount, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import Pending from './Pending';

function Contents({ account, items }: { account: BaseAccount; items: Record<string, TransactionItem[]> }) {
  const data = useMemo(
    () =>
      Object.entries(items)
        .map((item) => [BigInt(item[0]), item[1]] as const)
        .sort((l, r) => (l > r ? 1 : -1)),
    [items]
  );

  return data.map(([nonce, value]) => (
    <SafeTxCard
      hiddenConflictWarning
      defaultOpen={false}
      account={account}
      key={`queue-${nonce}`}
      data={value}
      nonce={nonce}
    />
  ));
}

function History({ account }: { account: BaseAccount }) {
  const chainId = useChainId();
  const [items] = useHistoryTransactions(chainId, account.address);

  return (
    <div className='space-y-5'>
      {Object.entries(items).map(([dayStart, values]) => (
        <div key={dayStart} className='space-y-2.5'>
          <p className='font-bold text-medium'>{dayjs(Number(dayStart)).format('YYYY-MM-DD')}</p>
          <Contents account={account} items={values} />
        </div>
      ))}
    </div>
  );
}

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

  return (
    <div className='space-y-5'>
      {account && (
        <Tabs
          color='primary'
          aria-label='Transaction'
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key.toString())}
          classNames={{
            tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
            tabContent: ['text-primary/50', 'font-bold'],
            cursor: ['rounded-medium']
          }}
        >
          <Tab key='pending' title='Pending'>
            <Pending account={account} />
          </Tab>
          <Tab key='history' title='History'>
            <History account={account} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

export default Transaction;
