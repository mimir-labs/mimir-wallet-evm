// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import {
  Card,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Tab,
  Tabs
} from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useToggle } from 'react-use';
import { useChainId } from 'wagmi';

import IconFilter from '@mimir-wallet/assets/svg/icon-filter.svg?react';
import {
  Button,
  Empty,
  InputAddress,
  InputToken,
  ModuleTxCard,
  ReceivedCard,
  SafeTxCard
} from '@mimir-wallet/components';
import { useAccountTokens, useHistory, useMediaQuery, useQueryParam } from '@mimir-wallet/hooks';
import {
  HistoryType,
  ModuleTransactionResponse,
  ReceivedResponse,
  TransactionSignature
} from '@mimir-wallet/hooks/types';

type Filter = {
  startTime?: number | null;
  endTime?: number | null;
  to?: string | null;
  module?: string | null;
  token?: string | null;
};

const pageSize = 20;

const skeleton = Array.from({ length: 6 }).map((_, index) => (
  <Card className='space-y-5 p-4 mt-5' radius='lg' key={index}>
    <Skeleton className='rounded-lg'>
      <div className='h-10 rounded-lg bg-default-300' />
    </Skeleton>
  </Card>
));

function Content({ safeAccount, type, filter }: { safeAccount: BaseAccount; type?: HistoryType; filter?: Filter }) {
  const chainId = useChainId();

  const [data, isFetched, isFetching, hasNexPage, , fetchNextPage] = useHistory(
    chainId,
    pageSize,
    safeAccount.address,
    type,
    filter?.startTime || undefined,
    filter?.endTime || undefined,
    filter?.to || undefined,
    filter?.module || undefined,
    filter?.token || undefined
  );

  if (isFetched && data && data.length === 0) {
    return <Empty height='80dvh' />;
  }

  if (!isFetched && isFetching) {
    return <div className='space-y-5'>{skeleton}</div>;
  }

  const dayStart: Record<string, boolean> = {};

  return (
    <InfiniteScroll
      className='space-y-5 mt-5'
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
              account={safeAccount}
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

function History({ account }: { account: BaseAccount }) {
  const [type, setType] = useQueryParam<string>('history_type', 'all', { replace: true });
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const [to, setTo] = useState<string>('');
  const [module, setModule] = useState<string>('');
  const [token, setToken] = useState<Address>();
  const [filter, setFilter] = useState<Filter>({});
  const [isOpen, toggleOpen] = useToggle(false);
  const [tokens] = useAccountTokens(account.address);
  const upSm = useMediaQuery('sm');

  const historyType =
    type === 'outgoing'
      ? HistoryType.SafeTx
      : type === 'incoming'
        ? HistoryType.Received
        : type === 'modules'
          ? HistoryType.ModuleTx
          : undefined;

  const filterElement = (
    <>
      <div className='w-full flex sm:flex-row flex-col items-center justify-between gap-3'>
        <DatePicker
          variant='bordered'
          label={<b>Start Time</b>}
          fullWidth
          labelPlacement='outside'
          maxValue={
            endTime ? parseDate(dayjs(endTime).format('YYYY-MM-DD')).subtract({ days: 1 }) : today(getLocalTimeZone())
          }
          value={startTime ? parseDate(dayjs(startTime).format('YYYY-MM-DD')) : null}
          onChange={(date) => {
            setStartTime(date.toDate(getLocalTimeZone()).getTime());
          }}
        />
        <DatePicker
          variant='bordered'
          label={<b>End Time</b>}
          fullWidth
          labelPlacement='outside'
          minValue={startTime ? parseDate(dayjs(startTime).format('YYYY-MM-DD')).add({ days: 1 }) : undefined}
          maxValue={today(getLocalTimeZone())}
          value={endTime ? parseDate(dayjs(endTime).format('YYYY-MM-DD')) : null}
          onChange={(date) => {
            setEndTime(date.toDate(getLocalTimeZone()).getTime());
          }}
        />
      </div>

      {historyType === HistoryType.SafeTx && (
        <InputAddress
          isSign={false}
          onChange={setTo}
          value={to}
          label='Interact with'
          placeholder='Enter ethereum address'
        />
      )}

      {historyType === HistoryType.ModuleTx && (
        <InputAddress
          isSign={false}
          onChange={setModule}
          value={module}
          label='Module Contract'
          placeholder='Enter ethereum address'
        />
      )}

      {historyType === HistoryType.Received && (
        <InputToken
          showBalance={false}
          label='Token'
          placeholder='Enter ethereum address'
          account={account.address}
          tokens={tokens.assets}
          onChange={setToken}
          value={token}
        />
      )}

      <div className='w-full flex gap-3'>
        <Button
          color='primary'
          variant='bordered'
          fullWidth
          onClick={() => {
            setStartTime(undefined);
            setEndTime(undefined);
            setTo('');
            setModule('');
            setToken(undefined);
            setFilter({});
            toggleOpen(false);
          }}
        >
          Clear
        </Button>
        <Button
          color='primary'
          fullWidth
          onClick={() => {
            setFilter({ startTime, endTime, to, module, token });
            toggleOpen(false);
          }}
        >
          Confirm
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className='flex items-center justify-between'>
        <Tabs
          color='primary'
          selectedKey={type}
          onSelectionChange={(key) => setType(key.toString())}
          variant='underlined'
          classNames={{
            tabList: ['sm:p-2.5 p-1.5 sm:gap-2.5 gap-1'],
            tab: ['sm:px-3 px-2']
          }}
        >
          <Tab key='all' title='All' />
          <Tab key='outgoing' title='Outgoing' />
          <Tab key='incoming' title='Incoming' />
          <Tab key='modules' title='Modules' />
        </Tabs>

        {upSm ? (
          <Popover placement='bottom-end' color='default' isOpen={isOpen} onOpenChange={(open) => toggleOpen(open)}>
            <PopoverTrigger>
              <Button color='primary' variant='bordered' radius='full' startContent={<IconFilter />}>
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className='sm:w-[450px] w-[calc(100vw-40px)] p-5 gap-y-5'>{filterElement}</PopoverContent>
          </Popover>
        ) : (
          <Button
            color='primary'
            variant='bordered'
            radius='full'
            startContent={<IconFilter />}
            size='sm'
            onClick={toggleOpen}
          >
            Filter
          </Button>
        )}
      </div>

      <Content safeAccount={account} type={historyType} filter={filter} />

      <Modal isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader />
          <ModalBody className='px-4'>{filterElement}</ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}

export default History;
