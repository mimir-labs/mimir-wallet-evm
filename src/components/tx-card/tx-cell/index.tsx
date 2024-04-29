// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hex } from 'viem';

import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils';
import { AnimatePresence, domAnimation, LazyMotion, motion, useWillChange } from 'framer-motion';
import React from 'react';

import Details from './Details';

interface Props {
  data: Hex;
  to?: Address;
  value: bigint;
  isOpen: boolean;
  items: React.ReactNode;
  details?: React.ReactNode;
  children?: React.ReactNode;
}

function TxCell({ isOpen, items, children, details, to, value, data }: Props) {
  const willChange = useWillChange();

  return (
    <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden transition-all'>
      {items}
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
                <Details data={data} to={to} value={value}>
                  {details}
                </Details>
                {children}
              </div>
            </motion.div>
          </LazyMotion>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(TxCell);
