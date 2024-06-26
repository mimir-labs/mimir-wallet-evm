// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Accordion, AccordionItem, Divider } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import { AddressRow, Bytes, CallDisplay, FormatBalance, FunctionName } from '@mimir-wallet/components';
import { hashSafeTransaction } from '@mimir-wallet/safe';
import { MetaTransaction, Operation, SafeTransaction } from '@mimir-wallet/safe/types';

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

function TxDetails({
  tx,
  safeTx,
  address,
  isCancel
}: {
  tx: MetaTransaction;
  safeTx?: SafeTransaction;
  address: Address;
  isCancel: boolean;
}) {
  const [isOpen, toggleOpen] = useToggle(false);
  const chainId = useChainId();
  const { chain } = useAccount();
  const hash = useMemo(
    () => (safeTx ? hashSafeTransaction(chainId, address, safeTx) : null),
    [safeTx, chainId, address]
  );

  const details = (
    <div className='bg-secondary rounded-small p-2.5 space-y-1'>
      <Item label='Hash' content={hash} />
      <Item label='To' content={<AddressRow iconSize={16} withCopy address={tx.to} />} />
      <Item label='Value' content={<FormatBalance value={tx.value} showSymbol {...chain?.nativeCurrency} />} />
      <Item label='Operation' content={Operation[tx.operation]} />
      <Item label='safeTxGas' content={<FormatBalance value={safeTx?.safeTxGas} showSymbol={false} />} />
      <Item label='baseGas' content={<FormatBalance value={safeTx?.baseGas} showSymbol={false} />} />
      <Item label='refundReceiver' content={<AddressRow iconSize={16} withCopy address={safeTx?.refundReceiver} />} />
      <Item label='Raw Data' content={<Bytes data={tx.data} />} />
    </div>
  );

  if (isCancel) {
    return details;
  }

  return (
    <div>
      <h6 className='font-bold text-small'>Transaction Details</h6>
      <Accordion defaultSelectedKeys='all' className='px-0'>
        <AccordionItem
          indicator={<ArrowLeft />}
          isCompact
          classNames={{
            titleWrapper: ['py-0'],
            title: ['py-0 text-small font-bold flex justify-between'],
            content: 'p-2.5 space-y-2.5 border-1 border-secondary rounded-medium'
          }}
          key='1'
          aria-label='Transaction Details'
          title={
            <span className='text-primary'>
              <FunctionName data={tx.data} />
            </span>
          }
        >
          <div className='py-2.5'>
            <CallDisplay from={address} to={tx.to} data={tx.data} value={tx.value} />
          </div>

          <Divider />

          <div onClick={toggleOpen} className='cursor-pointer text-primary font-bold text-small'>
            {isOpen ? 'Hide Details' : 'View Details'}
          </div>

          {isOpen ? details : null}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default React.memo(TxDetails);
