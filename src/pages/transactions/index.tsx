// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Tab, Tabs } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo } from 'react';
import { useChainId } from 'wagmi';

import { Empty, ModuleTxCard, ReceivedCard, SafeTxCard } from '@mimir-wallet/components';
import { HistoryItem, useHistoryTransactions, useQueryAccount, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import Messages from './Messages';
import Pending from './Pending';

function Contents({ account, items }: { account: BaseAccount; items: HistoryItem[] }) {
  const list = useMemo(
    () =>
      [...items].sort((l, r) => {
        const lTime =
          l.type === 'allowance-tx'
            ? l.data.createdAt
            : l.type === 'received-tx'
              ? new Date(l.data.createdAt).valueOf()
              : l.type === 'safe-module-tx'
                ? new Date(l.data.createdAt).valueOf()
                : l.data.transaction.updatedAt;

        const rTime =
          r.type === 'allowance-tx'
            ? r.data.createdAt
            : r.type === 'received-tx'
              ? new Date(r.data.createdAt).valueOf()
              : r.type === 'safe-module-tx'
                ? new Date(r.data.createdAt).valueOf()
                : r.data.transaction.updatedAt;

        return rTime - lTime;
      }),
    [items]
  );

  return list.map((item) =>
    item.type === 'safe-tx' ? (
      <SafeTxCard
        hiddenConflictWarning
        defaultOpen={false}
        account={account}
        key={`queue-${item.data.transaction.updatedAt}-${item.data.transaction.nonce}`}
        data={[item.data]}
        nonce={item.data.transaction.nonce}
      />
    ) : item.type === 'safe-module-tx' ? (
      <ModuleTxCard defaultOpen={false} data={item.data} />
    ) : item.type === 'allowance-tx' ? null : item.type === 'received-tx' ? (
      <ReceivedCard defaultOpen={false} data={item.data} />
    ) : null
  );
}

function History({ account }: { account: BaseAccount }) {
  const chainId = useChainId();
  const [items, isFetched] = useHistoryTransactions(chainId, account.address);

  if (isFetched && Object.keys(items).length === 0) {
    return <Empty height='80dvh' />;
  }

  return (
    <div className='space-y-5'>
      {Object.entries(items).map(([dayStart, values]) => (
        <div key={dayStart} className='space-y-2.5'>
          <p className='font-bold text-medium'>
            {dayjs(Number(dayStart)).startOf('days').valueOf() === dayjs().startOf('days').valueOf()
              ? 'Today'
              : dayjs(Number(dayStart)).format('MMM DD, YYYY')}
          </p>
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
          <Tab key='message' title='Messages'>
            <Messages account={account} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

export default Transaction;
