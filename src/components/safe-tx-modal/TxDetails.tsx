// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Accordion, AccordionItem } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { Address, size } from 'viem';
import { useAccount } from 'wagmi';

import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import { hashSafeTransaction } from '@mimir-wallet/safe';
import { Operation, type SafeTransaction } from '@mimir-wallet/safe/types';

import AddressRow from '../AddressRow';
import Bytes from '../Bytes';
import FormatBalance from '../FormatBalance';
import FunctionArgs from '../FunctionArgs';
import FunctionName from '../FunctionName';

function Item({ label, content }: { label: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className='grid grid-cols-10 text-tiny'>
      <div className='col-span-3 font-bold self-center tex-foreground'>{label}</div>
      <div className='col-span-7 self-center text-foreground/50 max-w-full overflow-hidden text-ellipsis'>
        {content}
      </div>
    </div>
  );
}

function TxDetails({ tx, address, nonce }: { tx: Omit<SafeTransaction, 'nonce'>; address: Address; nonce?: bigint }) {
  const { chain } = useAccount();
  const dataSize = useMemo(() => size(tx.data), [tx.data]);
  const hash = useMemo(
    () => (chain && nonce !== undefined ? hashSafeTransaction(chain, address, { ...tx, nonce }) : null),
    [chain, address, nonce, tx]
  );

  return (
    <Accordion defaultSelectedKeys='all' className='px-0'>
      <AccordionItem
        indicator={<ArrowLeft />}
        isCompact
        classNames={{
          titleWrapper: ['py-0'],
          title: ['py-0 text-small font-bold flex justify-between'],
          content: 'p-0 pb-2 space-y-2'
        }}
        key='1'
        aria-label='Transaction Details'
        title={
          <>
            Transaction Details
            <span className='text-primary'>
              <FunctionName data={tx.data} />
            </span>
          </>
        }
      >
        {dataSize ? (
          <div className='bg-secondary rounded-small p-2.5 space-y-1'>
            <FunctionArgs data={tx.data} />
          </div>
        ) : null}
        <div className='bg-secondary rounded-small p-2.5 space-y-1'>
          <Item label='Hash' content={hash} />
          <Item label='To' content={<AddressRow iconSize={16} withCopy address={tx.to} />} />
          <Item label='Value' content={<FormatBalance value={tx.value} showSymbol {...chain?.nativeCurrency} />} />
          <Item label='Operation' content={Operation[tx.operation]} />
          <Item label='safeTxGas' content={<FormatBalance value={tx.safeTxGas} showSymbol={false} />} />
          <Item label='baseGas' content={<FormatBalance value={tx.baseGas} showSymbol={false} />} />
          <Item label='refundReceiver' content={<AddressRow iconSize={16} withCopy address={tx.refundReceiver} />} />
          <Item label='Raw Data' content={<Bytes data={tx.data} />} />
        </div>
      </AccordionItem>
    </Accordion>
  );
}

export default React.memo(TxDetails);
