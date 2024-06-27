// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReceivedResponse } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React from 'react';
import { useToggle } from 'react-use';

import { AddressRow, FormatBalance, Hash } from '@mimir-wallet/components';
import { useToken } from '@mimir-wallet/hooks';

import { Item } from '../tx-cell/Details';

interface Props {
  defaultOpen?: boolean;
  transaction: ReceivedResponse;
}

function Items({ transaction }: Props) {
  const [tokenMeta] = useToken(transaction.tokenMeta ? undefined : transaction.token);

  return (
    <>
      <Item label='Token' content={<AddressRow address={transaction.token} iconSize={16} isToken />} />
      <Item label='Sender' content={<AddressRow address={transaction.sender} iconSize={16} />} />
      <Item label='Value' content={<FormatBalance value={transaction.value} showSymbol {...tokenMeta} />} />
    </>
  );
}

function Details({ defaultOpen = false, transaction }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen);

  return (
    <>
      <Item label='Time' content={dayjs(transaction.createdAt).format()} />
      <Item label='Transaction' content={<Hash hash={transaction.transaction} withExplorer />} />

      <div onClick={toggleOpen} className='cursor-pointer text-primary font-bold text-small'>
        {isOpen ? 'Hide' : 'View'} Details
      </div>

      {isOpen && <Items transaction={transaction} />}
    </>
  );
}

export default React.memo(Details);
