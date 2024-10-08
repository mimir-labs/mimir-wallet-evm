// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Link, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React from 'react';
import { zeroAddress } from 'viem';

import IconSend from '@mimir-wallet/assets/svg/icon-send-filled.svg?react';
import { Address as AddressComp, AddressIcon, Button, Empty } from '@mimir-wallet/components';
import { useAccountTokens } from '@mimir-wallet/hooks';

function Tokens({ address }: { address: Address }) {
  const [data, isFetched, isFetching] = useAccountTokens(address);

  return (
    <Table
      classNames={{
        th: ['bg-transparent', 'text-tiny', 'text-foreground/50']
      }}
    >
      <TableHeader>
        <TableColumn>Tokens</TableColumn>
        <TableColumn>Price</TableColumn>
        <TableColumn>Amount</TableColumn>
        <TableColumn>USD Value</TableColumn>
        <TableColumn className='text-end'>Operation</TableColumn>
      </TableHeader>
      <TableBody
        items={data.assets}
        isLoading={isFetching && !isFetched}
        loadingContent={<Spinner color='primary' />}
        emptyContent={<Empty label='No tokens' height={150} />}
      >
        {(item) => (
          <TableRow key={item.tokenAddress}>
            <TableCell>
              <div className='flex items-center gap-x-[5px]'>
                <AddressIcon isToken size={30} src={item.icon || undefined} address={item.tokenAddress} />
                <span>{item.symbol}</span>
                {item.tokenAddress !== zeroAddress && (
                  <span className='text-tiny text-foreground/50'>
                    <AddressComp address={item.tokenAddress} />
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>${item.price}</TableCell>
            <TableCell>{item.balance}</TableCell>
            <TableCell>${item.balanceUsd}</TableCell>
            <TableCell className='text-end'>
              <Button
                as={Link}
                href={`/apps/${encodeURIComponent(`mimir://app/transfer?token=${item.tokenAddress}&callbackPath=${encodeURIComponent('/assets')}`)}`}
                size='sm'
                variant='bordered'
                color='primary'
                radius='full'
                endContent={<IconSend />}
              >
                Transfer
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default React.memo(Tokens);
