// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Card, Skeleton, Tab, Tabs } from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useContext, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useChainId } from 'wagmi';

import { Empty, ModuleTxCard, ReceivedCard, SafeTxCard } from '@mimir-wallet/components';
import { useHistory, useQueryAccount, useQueryParam } from '@mimir-wallet/hooks';
import {
  HistoryType,
  ModuleTransactionResponse,
  ReceivedResponse,
  TransactionSignature
} from '@mimir-wallet/hooks/types';
import { AddressContext } from '@mimir-wallet/providers';

import Messages from './Messages';
import Pending from './Pending';

const pageSize = 50;

const skeleton = Array.from({ length: 6 }).map((_, index) => (
  <Card className='space-y-5 p-4' radius='lg' key={index}>
    <Skeleton className='rounded-lg'>
      <div className='h-10 rounded-lg bg-default-300' />
    </Skeleton>
  </Card>
));

function History({ account }: { account: BaseAccount }) {
  const chainId = useChainId();

  const [data, isFetched, isFetching, hasNexPage, , fetchNextPage] = useHistory(chainId, pageSize, account.address);

  if (isFetched && data && data.length === 0) {
    return <Empty height='80dvh' />;
  }

  if (!isFetched && isFetching) {
    return <div className='space-y-5'>{skeleton}</div>;
  }

  const dayStart: Record<string, boolean> = {};

  return (
    <InfiniteScroll
      className='space-y-5'
      dataLength={data?.length || 0}
      next={fetchNextPage}
      hasMore={hasNexPage}
      loader={skeleton}
      endMessage={<h4 className='text-medium text-center text-foreground/50'>no data more.</h4>}
    >
      {data?.map((item) => {
        const element =
          item.type === HistoryType.SafeTx ? (
            <SafeTxCard
              hiddenConflictWarning
              defaultOpen={false}
              account={account}
              key={`safe-tx-${item.relatedId}`}
              data={[item.data as TransactionSignature]}
              nonce={(item.data as TransactionSignature).transaction.nonce}
            />
          ) : item.type === HistoryType.ModuleTx ? (
            <ModuleTxCard
              key={`module-tx-${item.relatedId}`}
              defaultOpen={false}
              data={item.data as ModuleTransactionResponse}
            />
          ) : item.type === HistoryType.Received ? (
            <ReceivedCard
              key={`module-tx-${item.relatedId}`}
              defaultOpen={false}
              data={item.data as ReceivedResponse}
            />
          ) : null;

        const startDay = dayjs(item.time).startOf('days').valueOf();

        if (dayStart[startDay]) {
          return element;
        }

        dayStart[startDay] = true;

        return (
          <React.Fragment key={`time-${item.time}`}>
            <p className='font-bold text-medium'>
              {dayjs(Number(item.time)).startOf('days').valueOf() === dayjs().startOf('days').valueOf()
                ? 'Today'
                : dayjs(Number(item.time)).format('MMM DD, YYYY')}
            </p>
            {element}
          </React.Fragment>
        );
      })}
    </InfiniteScroll>
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
          <Tab key='message' title='Message'>
            <Messages account={account} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

export default Transaction;
