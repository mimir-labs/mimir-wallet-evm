// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hex } from 'viem';
import type { CallFunctions, ParsedCall } from '@mimir-wallet/hooks/types';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useToggle } from 'react-use';
import { useAccount } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { useParseCall, useParseMultisend } from '@mimir-wallet/hooks';

import Button from '../Button';
import FormatBalance from '../FormatBalance';
import FunctionArgs from '../FunctionArgs';
import CallDetails from './CallDetails';
// eslint-disable-next-line import/no-cycle
import CallDisplay from './CallDisplay';

function Item({ index, to, value, data }: { index: number; data: Hex; to: Address; value: bigint }) {
  const [isOpen, toggleOpen] = useToggle(false);
  const [dataSize, parsed] = useParseCall(data);
  const multisend = useParseMultisend(parsed);
  const { chain } = useAccount();

  const Top = (
    <div className='h-10 px-3 grid grid-cols-10'>
      <div className='col-span-3 flex items-center'>{index}</div>
      <div className='col-span-3 flex items-center'>{parsed.functionName}</div>
      <div className='col-span-3 flex items-center'>
        {dataSize ? (
          <CallDetails multisend={multisend} parsed={parsed} />
        ) : (
          <FormatBalance
            prefix='- '
            value={value}
            decimals={chain?.nativeCurrency.decimals}
            showSymbol
            symbol={chain?.nativeCurrency.symbol}
          />
        )}
      </div>
      <div className='col-span-1 flex items-center justify-end'>
        <Button
          data-open={isOpen}
          onClick={toggleOpen}
          size='tiny'
          radius='full'
          variant='light'
          isIconOnly
          className='justify-self-end data-[open=true]:rotate-180'
          color='primary'
        >
          <ArrowDown />
        </Button>
      </div>
    </div>
  );

  return (
    <div data-open={isOpen} className='rounded-medium overflow-hidden transition-all bg-secondary'>
      {Top}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 180 }}
            exit={{
              opacity: 0,
              maxHeight: 180,
              height: 0,
              marginBottom: 0,
              paddingTop: 0,
              paddingBottom: 0
            }}
            className='mb-2.5 ml-2.5 mr-2.5 bg-white rounded-medium p-2.5'
          >
            <CallDisplay data={data} to={to} value={value} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Multisend({ parsed, data }: { parsed: ParsedCall<CallFunctions>; data: Hex }) {
  const txs = useParseMultisend(parsed);

  if (!txs) {
    return <FunctionArgs data={data} />;
  }

  return (
    <div className='space-y-2.5'>
      <div className='font-bold text-small'>Actions</div>
      {txs.map((tx, index) => (
        <Item data={tx.data} value={tx.value} to={tx.to} index={index + 1} key={index} />
      ))}
    </div>
  );
}

export default React.memo(Multisend);
