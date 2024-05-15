// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Accordion, AccordionItem, Divider } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import { hashSafeTransaction } from '@mimir-wallet/safe';
import { MetaTransaction, Operation, SafeTransaction } from '@mimir-wallet/safe/types';

import AddressRow from '../AddressRow';
import Bytes from '../Bytes';
import { CallDisplay } from '../call-display';
import FormatBalance from '../FormatBalance';
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

function TxDetails({ tx, safeTx, address }: { tx: MetaTransaction; safeTx?: SafeTransaction; address: Address }) {
  const [isOpen, toggleOpen] = useToggle(false);
  const chainId = useChainId();
  const { chain } = useAccount();
  const hash = useMemo(
    () => (safeTx ? hashSafeTransaction(chainId, address, safeTx) : null),
    [safeTx, chainId, address]
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
        <div className='py-2'>
          <CallDisplay from={address} to={tx.to} data={tx.data} value={tx.value} />
        </div>
        <Divider />
        <div onClick={toggleOpen} className='cursor-pointer text-primary font-bold text-small'>
          Details
        </div>
        {isOpen && (
          <div className='bg-secondary rounded-small p-2.5 space-y-1'>
            <Item label='Hash' content={hash} />
            <Item label='To' content={<AddressRow iconSize={16} withCopy address={tx.to} />} />
            <Item label='Value' content={<FormatBalance value={tx.value} showSymbol {...chain?.nativeCurrency} />} />
            <Item label='Operation' content={Operation[tx.operation]} />
            <Item label='safeTxGas' content={<FormatBalance value={safeTx?.safeTxGas} showSymbol={false} />} />
            <Item label='baseGas' content={<FormatBalance value={safeTx?.baseGas} showSymbol={false} />} />
            <Item
              label='refundReceiver'
              content={<AddressRow iconSize={16} withCopy address={safeTx?.refundReceiver} />}
            />
            <Item label='Raw Data' content={<Bytes data={tx.data} />} />
          </div>
        )}
      </AccordionItem>
    </Accordion>
  );
}

export default React.memo(TxDetails);
