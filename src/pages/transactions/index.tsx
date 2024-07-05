// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Pagination, Tab, Tabs } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo } from 'react';
import { useChainId } from 'wagmi';

import { Empty, ModuleTxCard, ReceivedCard, SafeTxCard } from '@mimir-wallet/components';
import { useHistory, useQueryAccount, useQueryParam } from '@mimir-wallet/hooks';
import {
  type HistoryData,
  HistoryType,
  ModuleTransactionResponse,
  ReceivedResponse,
  TransactionSignature
} from '@mimir-wallet/hooks/types';
import { AddressContext } from '@mimir-wallet/providers';

import Messages from './Messages';
import Pending from './Pending';

function Contents({ account, items }: { account: BaseAccount; items: HistoryData[] }) {
  return items.map((item) =>
    item.type === HistoryType.SafeTx ? (
      <SafeTxCard
        hiddenConflictWarning
        defaultOpen={false}
        account={account}
        key={`safe-tx-${item.relatedId}`}
        data={[item.data]}
        nonce={(item.data as TransactionSignature).transaction.nonce}
      />
    ) : item.type === HistoryType.ModuleTx ? (
      <ModuleTxCard
        key={`module-tx-${item.relatedId}`}
        defaultOpen={false}
        data={item.data as ModuleTransactionResponse}
      />
    ) : item.type === HistoryType.Received ? (
      <ReceivedCard defaultOpen={false} data={item.data as ReceivedResponse} />
    ) : null
  );
}

const initialPage = 1;
const pageSize = 20;

function History({ account }: { account: BaseAccount }) {
  const chainId = useChainId();
  const [page, setPage] = useQueryParam('page', initialPage.toString());

  const [data, { pageCount }, isFetched, isFetching, isPlaceholderData] = useHistory(
    chainId,
    Number(page),
    pageSize,
    account.address
  );

  const entries = useMemo(() => Object.entries(data || {}).sort(([l], [r]) => Number(r) - Number(l)), [data]);

  if (isFetched && Object.keys(entries).length === 0) {
    return <Empty height='80dvh' />;
  }

  return (
    <div className='space-y-5'>
      {entries.map(([dayStart, values]) => (
        <div
          data-fetching={!isFetched && isFetching}
          key={dayStart}
          className='space-y-2.5 data-[fetching=true]:blur-sm'
        >
          <p className='font-bold text-medium'>
            {dayjs(Number(dayStart)).startOf('days').valueOf() === dayjs().startOf('days').valueOf()
              ? 'Today'
              : dayjs(Number(dayStart)).format('MMM DD, YYYY')}
          </p>
          <Contents account={account} items={values} />
        </div>
      ))}

      <div className='flex justify-end'>
        {(isFetched || isPlaceholderData) && (
          <Pagination
            isDisabled={!isFetched && isFetching}
            showControls
            page={Number(page)}
            total={pageCount}
            onChange={(page) => setPage(page.toString())}
          />
        )}
      </div>
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
          <Tab key='message' title='Message'>
            <Messages account={account} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

export default Transaction;
