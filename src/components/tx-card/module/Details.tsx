// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ModuleTransactionResponse } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React from 'react';
import { useToggle } from 'react-use';

import { AddressRow, Bytes, FormatBalance, Hash } from '@mimir-wallet/components';
import { useCurrentChain } from '@mimir-wallet/hooks';
import { Operation } from '@mimir-wallet/safe/types';

import { Item } from '../tx-cell/Details';

interface Props {
  defaultOpen?: boolean;
  transaction: ModuleTransactionResponse;
}

function Details({ defaultOpen = false, transaction }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen);
  const [, chain] = useCurrentChain();

  return (
    <>
      <Item label='Module' content={<AddressRow iconSize={16} withCopy address={transaction.module} />} />
      <Item label='Transaction' content={<Hash hash={transaction.transaction} withExplorer />} />
      <Item label='Execute Time' content={dayjs(transaction.updatedAt).format()} />

      <div onClick={toggleOpen} className='cursor-pointer text-primary font-bold text-small'>
        {isOpen ? 'Hide' : 'View'} Details
      </div>

      {isOpen && (
        <>
          <Item label='To' content={<AddressRow iconSize={16} withCopy address={transaction.to} />} />
          <Item
            label='Value'
            content={<FormatBalance value={transaction.value} showSymbol {...chain?.nativeCurrency} />}
          />
          <Item label='Operation' content={Operation[transaction.operation]} />
          <Item label='Raw Data' content={<Bytes data={transaction.data} />} />
        </>
      )}
    </>
  );
}

export default React.memo(Details);
