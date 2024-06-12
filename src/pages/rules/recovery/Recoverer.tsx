// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { DelayModule } from '@mimir-wallet/features/delay/types';

import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressRow, Empty, SafeTxButton } from '@mimir-wallet/components';
import { EmptyArray, ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { buildDeleteDelayModule } from '@mimir-wallet/safe';

import TooltipItem from '../TooltipItem';

function Recoverer({
  safeAccount,
  data,
  isDataFetched,
  isDataFetching
}: {
  safeAccount: Address;
  data: DelayModule[];
  isDataFetched: boolean;
  isDataFetching: boolean;
}) {
  const navigate = useNavigate();

  const list = useMemo(() => {
    if (data.length === 0) return EmptyArray;

    return data
      .map((item) =>
        item.modules.map((module) => ({
          module,
          address: item.address,
          expiration: item.expiration,
          cooldown: item.cooldown
        }))
      )
      .flat();
  }, [data]);

  return (
    <Table>
      <TableHeader>
        <TableColumn width='30%'>Recoverer</TableColumn>
        <TableColumn width='30%'>
          <TooltipItem content='A period that begins after a recovery submitted on-chain, during which the Safe Account signers can review the proposal and cancel it before it is executable.'>
            Review Window
          </TooltipItem>
        </TableColumn>
        <TableColumn width='30%'>
          <TooltipItem content='A period after which the recovery proposal will expire and can no longer be executed.'>
            Proposal Expiry
          </TooltipItem>
        </TableColumn>
        <TableColumn width='10%'>Operation</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isDataFetching && !isDataFetched}
        loadingContent={<Spinner color='primary' />}
        items={list}
        emptyContent={<Empty height={150} />}
      >
        {(item) => {
          const colldown = Number(item.cooldown);
          const expiration = Number(item.expiration);

          return (
            <TableRow key={`${item.module}-${item.address}`}>
              <TableCell>
                <AddressRow iconSize={20} address={item.module} />
              </TableCell>
              <TableCell>
                {colldown > ONE_DAY
                  ? Math.floor(colldown / ONE_DAY)
                  : colldown > ONE_HOUR
                    ? Math.floor(colldown / ONE_HOUR)
                    : Math.floor(colldown / ONE_MINUTE)}{' '}
                {colldown > ONE_DAY ? 'Days' : colldown > ONE_HOUR ? 'Hours' : 'Minutes'}
              </TableCell>
              <TableCell>
                {expiration > ONE_DAY
                  ? Math.floor(expiration / ONE_DAY)
                  : expiration > ONE_HOUR
                    ? Math.floor(expiration / ONE_HOUR)
                    : expiration > ONE_MINUTE
                      ? Math.floor(expiration / ONE_MINUTE)
                      : 'Never'}{' '}
                {expiration > ONE_DAY
                  ? 'Days'
                  : expiration > ONE_HOUR
                    ? 'Hours'
                    : expiration > ONE_MINUTE
                      ? 'Minutes'
                      : ''}
              </TableCell>
              <TableCell>
                <SafeTxButton
                  metadata={{ website: 'mimir://internal/recovery' }}
                  isApprove={false}
                  isCancel={false}
                  address={safeAccount}
                  buildTx={(_, client) => buildDeleteDelayModule(client, safeAccount, item.address, item.module)}
                  onSuccess={() => navigate('/transactions')}
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

export default React.memo(Recoverer);
