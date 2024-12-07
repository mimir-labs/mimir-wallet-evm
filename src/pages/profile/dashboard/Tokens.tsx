// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Link, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React from 'react';
import { useToggle } from 'react-use';
import { zeroAddress } from 'viem';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-filled.svg?react';
import { Address as AddressComp, AddressIcon, Button, CopyAddressButton, Empty } from '@mimir-wallet/components';
import { useAccountTokens, useMediaQuery } from '@mimir-wallet/hooks';

import AddToken from './AddToken';

function Tokens({ address }: { address: Address }) {
  const [data, isFetched, isFetching] = useAccountTokens(address);
  const [isOpen, toggleOpen] = useToggle(false);
  const upSm = useMediaQuery('sm');

  return (
    <>
      <Button
        className='absolute right-0 sm:top-[8px] top-[12px]'
        onClick={toggleOpen}
        radius='full'
        color='primary'
        isIconOnly={!upSm}
        size={upSm ? 'md' : 'tiny'}
      >
        {upSm ? 'Add' : <IconAdd style={{ width: 10, height: 10 }} />}
      </Button>

      <Table
        classNames={{
          base: ['sm:[&>div]:p-4 [&>div]:p-2'],
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
                    <span className='text-tiny text-foreground/50 text-nowrap'>
                      <AddressComp address={item.tokenAddress} />
                    </span>
                  )}
                  <CopyAddressButton
                    size='tiny'
                    address={item.tokenAddress}
                    variant='light'
                    className='text-foreground/50'
                  />
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

      <AddToken isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default React.memo(Tokens);
