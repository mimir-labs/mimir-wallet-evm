// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { ChartData } from 'chart.js';

import {
  Card,
  CardBody,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import IconModule from '@mimir-wallet/assets/svg/icon-module.svg?react';
import IconSafe from '@mimir-wallet/assets/svg/icon-safe.svg?react';
import { AddressRow, Empty } from '@mimir-wallet/components';
import { useMediaQuery } from '@mimir-wallet/hooks';

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'top' as const
    },
    title: {
      display: false,
      text: 'Transactions'
    }
  }
};

function Chart({ txDaily }: { txDaily?: Array<{ time: string; address: Address; counts: number }> }) {
  const upSm = useMediaQuery('sm');
  const chartData: ChartData<'bar', number[], string> = useMemo(
    () => ({
      labels: txDaily?.map((item) => dayjs(Number(item.time)).format('YYYY-MM-DD')) || [],
      datasets: [
        {
          label: 'Counts',
          data: txDaily?.map((item) => item.counts) || [],
          backgroundColor: '#5F45FF'
        }
      ]
    }),
    [txDaily]
  );

  const element =
    txDaily && txDaily.length > 0 ? (
      <Bar data={chartData} options={options} />
    ) : (
      <Empty label='no transactions' height={200} />
    );

  return (
    <Card className='col-span-2'>
      <CardBody className='gap-5 sm:p-5 p-3'>
        <p className='font-bold text-medium text-foreground'>Transaction Counts</p>
        {upSm ? <div className='sm:p-5 p-3 bg-secondary rounded-large'>{element}</div> : element}
      </CardBody>
    </Card>
  );
}

function Transaction({
  moduleCounts,
  txCounts,
  moduleTxCounts,
  safeTxCounts,
  txDaily
}: {
  moduleCounts?: Record<Address, number>;
  txCounts?: Record<Address, number>;
  moduleTxCounts?: number;
  safeTxCounts?: number;
  txDaily?: Array<{ time: string; address: Address; counts: number }>;
}) {
  const txList = useMemo(
    () =>
      txCounts
        ? Object.entries(txCounts)
            .sort((l, r) => r[1] - l[1])
            .map(([address, count], index) => ({ order: index + 1, address, count }))
            .slice(0, 10)
        : [],
    [txCounts]
  );
  const moduleList = useMemo(
    () =>
      moduleCounts
        ? Object.entries(moduleCounts)
            .sort((l, r) => r[1] - l[1])
            .map(([address, count], index) => ({ order: index + 1, address, count }))
            .slice(0, 10)
        : [],
    [moduleCounts]
  );

  return (
    <div className='grid grid-cols-2 sm:gap-5 gap-2.5'>
      <Card className='col-span-2'>
        <CardBody className='sm:flex-row flex-col sm:px-12 px-4 sm:py-5 py-3 justify-between sm:items-center items-stretch sm:gap-10 gap-3'>
          <div className='flex-grow flex items-center justify-between'>
            <div className='flex items-center gap-2.5 sm:text-medium text-small text-foreground/50'>
              <IconSafe />
              Safe Transaction Executed
            </div>
            <b className='font-extrabold sm:text-[36px] sm:leading-[43px] text-[24px] leading-[30px]'>{safeTxCounts}</b>
          </div>

          <Divider orientation='vertical' className='bg-divider-300 h-5 sm:block hidden' />

          <div className='flex-grow flex items-center justify-between'>
            <div className='flex items-center gap-2.5 sm:text-medium text-small text-foreground/50'>
              <IconModule />
              Module Transaction Executed
            </div>
            <b className='font-extrabold sm:text-[36px] sm:leading-[43px] text-[24px] leading-[30px]'>
              {moduleTxCounts}
            </b>
          </div>
        </CardBody>
      </Card>

      <Card className='sm:col-span-1 col-span-2'>
        <CardBody className='gap-5 sm:p-5 p-3'>
          <p className='font-bold text-medium text-foreground/50'>Contract Interaction</p>
          <Table
            removeWrapper
            classNames={{
              th: ['bg-transparent', 'text-tiny', 'text-divider-300'],
              td: ['text-foreground']
            }}
          >
            <TableHeader>
              <TableColumn>Order</TableColumn>
              <TableColumn>Contract Address</TableColumn>
              <TableColumn>Transaction Count</TableColumn>
            </TableHeader>
            <TableBody items={txList} emptyContent={<Empty label='No items' height={150} />}>
              {(item) => (
                <TableRow key={item.order}>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>
                    <AddressRow address={item.address} />
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card className='sm:col-span-1 col-span-2'>
        <CardBody className='gap-5 sm:p-5 p-3'>
          <p className='font-bold text-medium text-foreground/50'>Module Transaction</p>
          <Table
            removeWrapper
            classNames={{
              th: ['bg-transparent', 'text-tiny', 'text-divider-300'],
              td: ['text-foreground']
            }}
          >
            <TableHeader>
              <TableColumn>Order</TableColumn>
              <TableColumn>Module Address</TableColumn>
              <TableColumn>Transaction Count</TableColumn>
            </TableHeader>
            <TableBody items={moduleList} emptyContent={<Empty label='No items' height={150} />}>
              {(item) => (
                <TableRow key={item.order}>
                  <TableCell>{item.order}</TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <AddressRow address={item.address} />
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Chart txDaily={txDaily} />
    </div>
  );
}

export default React.memo(Transaction);
