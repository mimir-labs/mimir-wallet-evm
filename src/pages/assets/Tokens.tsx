// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Link, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React from 'react';

import { AddressIcon, Button } from '@mimir-wallet/components';
import { useAccountTokens } from '@mimir-wallet/hooks';

function Tokens({ address }: { address: Address }) {
  const [data, isFetched, isFetching] = useAccountTokens(address);

  return (
    <Table
      classNames={{
        th: 'bg-secondary'
      }}
    >
      <TableHeader>
        <TableColumn>Assets</TableColumn>
        <TableColumn>Balance</TableColumn>
        <TableColumn>Balance(USD)</TableColumn>
        <TableColumn className='text-end'>Operation</TableColumn>
      </TableHeader>
      <TableBody items={data.assets} isLoading={isFetching && !isFetched} emptyContent='No tokens'>
        {(item) => (
          <TableRow key={item.tokenAddress}>
            <TableCell>
              <div className='flex items-center gap-x-2'>
                <AddressIcon isToken size={30} src={item.icon || undefined} address={item.tokenAddress} />
                {item.symbol}
              </div>
            </TableCell>
            <TableCell>{item.balance}</TableCell>
            <TableCell>{item.balanceUsd}</TableCell>
            <TableCell className='text-end'>
              <Button
                as={Link}
                href={`/apps/${encodeURIComponent(`mimir://app/transfer?token=${item.tokenAddress}`)}`}
                size='sm'
                variant='bordered'
                color='primary'
                radius='full'
              >
                Send
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default React.memo(Tokens);
