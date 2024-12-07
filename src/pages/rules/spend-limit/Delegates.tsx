// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { TokenAllowance } from '@mimir-wallet/features/allowance/types';
import type { TokenMeta } from '@mimir-wallet/hooks/types';

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressIcon, AddressRow, Empty, FormatBalance, SafeTxButton } from '@mimir-wallet/components';
import { ONE_DAY } from '@mimir-wallet/constants';
import { useAllowanceTokens } from '@mimir-wallet/features/allowance';
import { useCurrentChain, useTokens } from '@mimir-wallet/hooks';
import { buildDeleteAllowance } from '@mimir-wallet/safe';

import TooltipItem from '../TooltipItem';

function Delegates({ safeAccount }: { safeAccount: Address }) {
  const [data, isDataFetched, isDataFetching] = useAllowanceTokens(safeAccount);
  const tokens = useMemo(() => Array.from(new Set(data.map((item) => item.token))), [data]);
  const ercTokens = useTokens(tokens);
  const [, chain] = useCurrentChain();

  const items = useMemo(
    (): Array<TokenAllowance & { tokenMeta?: TokenMeta }> =>
      data
        .filter((item) => !!item.allowance[0])
        .map((item) => ({
          ...item,
          tokenMeta: ercTokens?.[item.token] || {}
        })),
    [data, ercTokens]
  );

  return (
    <Table>
      <TableHeader>
        <TableColumn width='22%'>Beneficiary</TableColumn>
        <TableColumn width='23%'>
          <TooltipItem content='Easy Expense users can use these funds without approval within a single Recover Time period.'>
            Token Limit
          </TooltipItem>
        </TableColumn>
        <TableColumn width='23%'>Spent</TableColumn>
        <TableColumn width='22%'>
          <TooltipItem content='You can choose to set a one-time allowance or to have it automatically refill after a defined time-period.'>
            Reset Time
          </TooltipItem>
        </TableColumn>
        <TableColumn width='10%'>Operation</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isDataFetching && !isDataFetched}
        loadingContent={<Spinner color='primary' />}
        items={items}
        emptyContent={<Empty height={150} />}
      >
        {(item) => {
          const resetTime = item.allowance[2]
            ? dayjs(Number(item.allowance[3] + item.allowance[2]) * 60 * 1000).format('YYYY-MM-DD HH:mm')
            : 'Once';

          const interval = item.allowance[2] ? ` / ${((Number(item.allowance[2]) * 60) / ONE_DAY).toFixed(0)} Day` : '';
          const tokenIcon = <AddressIcon isToken address={item.token} size={20} />;

          return (
            <TableRow key={`${item.delegate}-${item.token}`}>
              <TableCell>
                <AddressRow iconSize={20} address={item.delegate} withCopy />
              </TableCell>
              <TableCell>
                <div className='flex gap-1'>
                  <FormatBalance
                    value={item.allowance[0]}
                    decimals={item.tokenMeta?.decimals || chain.nativeCurrency.decimals}
                    showSymbol={false}
                  />
                  {tokenIcon}
                  <span>
                    {item.tokenMeta?.symbol}
                    {interval}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex gap-1'>
                  <FormatBalance
                    value={item.allowance[1]}
                    decimals={ercTokens[item.token]?.decimals || chain.nativeCurrency.decimals}
                    showSymbol={false}
                  />
                  {tokenIcon}
                  <span>{item.tokenMeta?.symbol}</span>
                </div>
              </TableCell>
              <TableCell>{resetTime}</TableCell>
              <TableCell>
                <SafeTxButton
                  metadata={{ website: 'mimir://internal/spend-limit' }}
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
