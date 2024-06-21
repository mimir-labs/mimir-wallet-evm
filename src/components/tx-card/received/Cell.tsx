// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReceivedResponse } from '@mimir-wallet/hooks/types';

import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils';
import { AnimatePresence, domAnimation, LazyMotion, motion, useWillChange } from 'framer-motion';
import React from 'react';
import { useToggle } from 'react-use';

import Details from './Details';
import TxItems from './TxItems';

interface Props {
  defaultOpen?: boolean;
  transaction: ReceivedResponse;
}

function Cell({ transaction, defaultOpen }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const willChange = useWillChange();

  return (
    <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden transition-all'>
      <TxItems transaction={transaction} isOpen={isOpen} toggleOpen={toggleOpen} />
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
              <div className='flex flex-col justify-between gap-3 p-3 mb-3 ml-3 mr-3 bg-white rounded-medium'>
                <Details defaultOpen={defaultOpen} transaction={transaction} />
              </div>
            </motion.div>
          </LazyMotion>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(Cell);
