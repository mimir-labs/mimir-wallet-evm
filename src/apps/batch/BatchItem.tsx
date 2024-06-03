// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import type { Address } from 'abitype';
import type { BatchTxItem } from '@mimir-wallet/hooks/types';

import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils';
import { Checkbox } from '@nextui-org/react';
import { AnimatePresence, domAnimation, LazyMotion, motion, useWillChange } from 'framer-motion';
import React from 'react';
import { useToggle } from 'react-use';
import { useChains } from 'wagmi';

import Drag from '@mimir-wallet/assets/images/drag.svg';
import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AppName, Button, CallDisplay, FormatBalance } from '@mimir-wallet/components';
import { useParseCall } from '@mimir-wallet/hooks';

export type BatchItemType = BatchTxItem & {
  from: Address;
  index: number;
  selected: number[];
  onSelected: (state: boolean) => void;
  onDelete: () => void;
};

interface Props {
  item: BatchItemType;
  itemSelected: number;
  dragHandleProps: object;
}

function BatchItem({
  item: { from, to, value, data, website, id, selected, onSelected, onDelete },
  dragHandleProps
}: Props) {
  const [isOpen, toggleOpen] = useToggle(false);
  const [dataSize, parsed] = useParseCall(data);
  const [chain] = useChains();
  const willChange = useWillChange();

  return (
    <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden transition-all'>
      <div className='cursor-pointer h-11 px-3 grid grid-cols-6 text-small' onClick={toggleOpen}>
        <div className='col-span-1 flex items-center' onClick={(e) => e.stopPropagation()}>
          <div className='p-2.5 -ml-2.5 cursor-pointer select-none' {...dragHandleProps}>
            <img src={Drag} alt='drag' />
          </div>
          <Checkbox size='sm' isSelected={selected.includes(id)} onValueChange={onSelected}>
            {id + 1}
          </Checkbox>
        </div>
        <div className='col-span-2 flex items-center'>
          <AppName website={website} />
        </div>
        <div className='col-span-2 flex items-center'>
          {dataSize ? (
            parsed.functionName
          ) : (
            <FormatBalance
              prefix='- '
              value={value}
              decimals={chain.nativeCurrency.decimals}
              showSymbol
              symbol={chain.nativeCurrency.symbol}
            />
          )}
        </div>
        <div className='col-span-1 flex items-center flex-row-reverse'>
          <Button
            data-open={isOpen}
            onClick={toggleOpen}
            size='tiny'
            radius='full'
            variant='light'
            isIconOnly
            className='data-[open=true]:rotate-180'
            color='primary'
          >
            <ArrowDown />
          </Button>
          <Button onClick={onDelete} size='tiny' radius='full' variant='light' isIconOnly color='danger'>
            <IconDelete />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <LazyMotion features={domAnimation}>
            <motion.div
              animate='enter'
              exit='exit'
              initial='exit'
              style={{ overflowY: 'hidden', willChange }}
              variants={TRANSITION_VARIANTS.collapse}
            >
              <div className='flex justify-between gap-3 p-3 mb-3 ml-3 mr-3 bg-white rounded-medium'>
                <div className='flex-1'>
                  <CallDisplay from={from} to={to} data={data} value={BigInt(value)} />
                </div>
              </div>
            </motion.div>
          </LazyMotion>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(BatchItem);
