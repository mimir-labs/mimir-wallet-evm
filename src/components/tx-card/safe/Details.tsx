// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';
import type { TransactionResponse } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import { AddressRow, Bytes, FormatBalance, Hash } from '@mimir-wallet/components';
import { hashSafeTransaction } from '@mimir-wallet/safe';
import { Operation } from '@mimir-wallet/safe/types';

import { Item } from '../tx-cell/Details';

interface Props {
  defaultOpen?: boolean;
  address: Address;
  transaction: TransactionResponse;
}

function Details({ address, defaultOpen = false, transaction }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen);
  const chainId = useChainId();
  const { chain } = useAccount();
  const hash = useMemo(() => hashSafeTransaction(chainId, address, transaction), [address, chainId, transaction]);

  return (
    <>
      <Item label='Hash' content={hash} />
      {transaction.executeTransaction ? (
        <Item label='Transaction' content={<Hash hash={transaction.executeTransaction} withExplorer />} />
      ) : null}
      <Item label='Create Time' content={dayjs(transaction.createdAt).format()} />
      {transaction.executeBlock ? <Item label='Execute Time' content={dayjs(transaction.updatedAt).format()} /> : null}

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
          <Item label='safeTxGas' content={<FormatBalance value={transaction.safeTxGas} showSymbol={false} />} />
          <Item label='baseGas' content={<FormatBalance value={transaction.baseGas} showSymbol={false} />} />
          <Item
            label='refundReceiver'
            content={<AddressRow iconSize={16} withCopy address={transaction.refundReceiver} />}
          />
          <Item label='Raw Data' content={<Bytes data={transaction.data} />} />
        </>
      )}
    </>
  );
}

export default React.memo(Details);
