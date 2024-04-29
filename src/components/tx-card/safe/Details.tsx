// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';
import type { TransactionResponse } from '@mimir-wallet/hooks/types';

import { Divider } from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { AddressRow, Bytes, FormatBalance } from '@mimir-wallet/components';
import { hashSafeTransaction } from '@mimir-wallet/safe';
import { Operation } from '@mimir-wallet/safe/types';

import { Item } from '../tx-cell/Details';

interface Props {
  address: Address;
  transaction: TransactionResponse;
}

function Details({ address, transaction }: Props) {
  const { chain } = useAccount();
  const hash = useMemo(
    () => (chain ? hashSafeTransaction(chain, address, transaction) : '0x'),
    [address, chain, transaction]
  );

  return (
    <>
      <Item label='Hash' content={hash} />
      {transaction.executeTransaction ? <Item label='Transaction' content={transaction.executeTransaction} /> : null}
      <Item label='Create Time' content={dayjs(transaction.createdAt).format()} />
      {transaction.executeBlock ? <Item label='Execute Time' content={dayjs(transaction.updatedAt).format()} /> : null}
      <Divider />
      <Item label='To' content={<AddressRow iconSize={16} withCopy address={transaction.to} />} />
      <Item label='Value' content={<FormatBalance value={transaction.value} showSymbol {...chain?.nativeCurrency} />} />
      <Item label='Operation' content={Operation[transaction.operation]} />
      <Item label='safeTxGas' content={<FormatBalance value={transaction.safeTxGas} showSymbol={false} />} />
      <Item label='baseGas' content={<FormatBalance value={transaction.baseGas} showSymbol={false} />} />
      <Item
        label='refundReceiver'
        content={<AddressRow iconSize={16} withCopy address={transaction.refundReceiver} />}
      />
      <Item label='Raw Data' content={<Bytes data={transaction.data} />} />
    </>
  );
}

export default React.memo(Details);
