// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useChains } from 'wagmi';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressIcon, AddressRow, Empty, FormatBalance, SafeTxButton } from '@mimir-wallet/components';
import { ONE_DAY } from '@mimir-wallet/constants';
import { useAllowanceTokens } from '@mimir-wallet/features/allowance';
import { useTokens } from '@mimir-wallet/hooks';
import { buildDeleteAllowance } from '@mimir-wallet/safe';

import TooltipItem from '../TooltipItem';

function Delegates({ safeAccount }: { safeAccount: Address }) {
  const [data, isDataFetched, isDataFetching] = useAllowanceTokens(safeAccount);
  const tokens = useMemo(() => Array.from(new Set(data.map((item) => item.token))), [data]);
  const ercTokens = useTokens(tokens);
  const [chain] = useChains();

  return (
    <Table>
      <TableHeader>
        <TableColumn width='30%'>Beneficiary</TableColumn>
        <TableColumn width='30%'>
          <TooltipItem content='Easy Expense users can use these funds without approval within a single Recover Time period.'>
            Token Limit
          </TooltipItem>
        </TableColumn>
        <TableColumn width='30%'>
          <TooltipItem content='You can choose to set a one-time allowance or to have it automatically refill after a defined time-period.'>
            Reset Time
          </TooltipItem>
        </TableColumn>
        <TableColumn width='10%'>Operation</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isDataFetching && !isDataFetched}
        loadingContent={<Spinner color='primary' />}
        items={data}
        emptyContent={<Empty height={300} />}
      >
        {(item) => {
          const resetTime = item.allowance[2]
            ? dayjs(Number(item.allowance[3] + item.allowance[2]) * 60 * 1000).format('YYYY-MM-DD HH:mm')
            : 'Once';

          const interval = item.allowance[2] ? ` / ${(Number(item.allowance[2]) * 60) / ONE_DAY} Day` : '';

          return (
            <TableRow key={`${item.delegate}-${item.token}`}>
              <TableCell>
                <AddressRow iconSize={20} address={item.delegate} withCopy />
              </TableCell>
              <TableCell>
                <div className='flex gap-1'>
                  <span className='min-w-[70px]'>
                    <FormatBalance
                      value={item.allowance[0] - item.allowance[1]}
                      decimals={ercTokens[item.token]?.decimals || chain.nativeCurrency.decimals}
                      showSymbol={false}
                    />
                  </span>
                  <AddressIcon isToken address={item.token} size={20} />
                  <span>
                    {ercTokens[item.token]?.symbol || chain.nativeCurrency.symbol}
                    {interval}
                  </span>
                </div>
              </TableCell>
              <TableCell>{resetTime}</TableCell>
              <TableCell>
                <SafeTxButton
                  website='mimir://internal/spend-limit'
                  isApprove={false}
                  isCancel={false}
                  address={safeAccount}
                  buildTx={(_, client) => buildDeleteAllowance(client, safeAccount, item.delegate, item.token)}
                  isToastError
                  isIconOnly
                  color='danger'
                  size='tiny'
                  variant='light'
                >
                  <IconDelete />
                </SafeTxButton>
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}

export default React.memo(Delegates);
