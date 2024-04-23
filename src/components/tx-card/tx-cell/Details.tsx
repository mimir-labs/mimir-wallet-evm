// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Hash } from 'viem';
import type { TransactionResponse } from '@mimir-wallet/hooks/types';

import { Divider } from '@nextui-org/react';
import dayjs from 'dayjs';
import React from 'react';
import { useAccount } from 'wagmi';

import { AddressRow, Bytes, CallDisplay, FormatBalance } from '@mimir-wallet/components';
import { Operation } from '@mimir-wallet/safe/types';

interface Props {
  hash: Hash;
  transaction: TransactionResponse;
}

function Item({ label, content }: { label: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className='grid grid-cols-10 text-tiny'>
      <div className='col-span-3 font-bold self-center tex-foreground'>{label}</div>
      <div className='col-span-7 self-center text-foreground/50'>{content}</div>
    </div>
  );
}

function Details({ hash, transaction }: Props) {
  const { chain } = useAccount();

  return (
    <div className='flex-1 space-y-2'>
      <CallDisplay data={transaction.data} to={transaction.to} value={transaction.value} />
      <Divider />
      <Item label='Create Time' content={dayjs(transaction.createdAt).format()} />
      <Item label='Hash' content={hash} />
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
    </div>
  );
}

export default React.memo(Details);
