// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AllowanceTransactionResponse } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React from 'react';
import { useToggle } from 'react-use';

import { AddressRow, FormatBalance, Hash } from '@mimir-wallet/components';
import { useToken } from '@mimir-wallet/hooks';

import { Item } from '../tx-cell/Details';

interface Props {
  defaultOpen?: boolean;
  transaction: AllowanceTransactionResponse;
}

function Items({ transaction }: Props) {
  const [tokenMeta] = useToken(transaction.token || undefined);
  const [paymentTokenMeta] = useToken(transaction.paymentToken || undefined);

  return (
    <>
      {transaction.token && (
        <Item label='Token' content={<AddressRow address={transaction.token} iconSize={16} isToken />} />
      )}
      {transaction.to && <Item label='To' content={<AddressRow address={transaction.to} iconSize={16} />} />}
      {transaction.value !== null && transaction.value !== undefined && (
        <Item label='Value' content={<FormatBalance value={transaction.value} showSymbol {...tokenMeta} />} />
      )}
      {transaction.nonce && <Item label='Nonce' content={transaction.nonce.toString()} />}

      {transaction.paymentToken && (
        <Item label='Payment Token' content={<AddressRow address={transaction.paymentToken} iconSize={16} isToken />} />
      )}
      {transaction.paymentToken && (
        <Item label='Payment Receiver' content={<AddressRow address={transaction.paymentReceiver} iconSize={16} />} />
      )}
      {transaction.payment !== null && transaction.payment !== undefined && (
        <Item
          label='Payment'
          content={<FormatBalance value={transaction.payment} showSymbol {...paymentTokenMeta} />}
        />
      )}

      {transaction.allowanceAmount !== null && transaction.allowanceAmount !== undefined && (
        <Item label='Value' content={<FormatBalance value={transaction.allowanceAmount} showSymbol {...tokenMeta} />} />
      )}
      {transaction.resetTime !== null && transaction.resetTime !== undefined && (
        <Item label='Reset Time' content={transaction.resetTime} />
      )}
    </>
  );
}

function Details({ defaultOpen = false, transaction }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen);

  return (
    <>
      <Item label='Delegate' content={<AddressRow iconSize={16} address={transaction.delegate} />} />
      <Item label='Transaction' content={<Hash hash={transaction.transaction} withExplorer />} />
      <Item label='Time' content={dayjs(transaction.createdAt).format()} />

      <div onClick={toggleOpen} className='cursor-pointer text-primary font-bold text-small'>
        {isOpen ? 'Hide' : 'View'} Details
      </div>

      {isOpen && <Items transaction={transaction} />}
    </>
  );
}

export default React.memo(Details);
