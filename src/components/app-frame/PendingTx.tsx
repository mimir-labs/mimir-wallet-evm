// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import React from 'react';
import { useToggle } from 'react-use';
import { useChainId } from 'wagmi';

import ExpandArrow from '@mimir-wallet/assets/svg/expand-arrow.svg?react';
import { usePendingTransactions, useQueryAccount } from '@mimir-wallet/hooks';

import Button from '../Button';
import { SafeTxCard } from '../tx-card';

function PendingTx({ address }: { address: Address }) {
  const chainId = useChainId();
  const [{ current, queue }] = usePendingTransactions(chainId, address);
  const counts = (current ? 1 : 0) + Object.keys(queue).length;
  const [expanded, toggleExpand] = useToggle(false);
  const account = useQueryAccount(address);

  return (
    <>
      <div
        data-expanded={expanded}
        className='pointer-events-none fixed w-full h-full left-0 right-0 top-0 bottom-0 bg-black/15 opacity-0 data-[expanded=true]:opacity-100 transition-opacity'
        onClick={toggleExpand}
        style={{ pointerEvents: expanded ? 'auto' : 'none' }}
      />
      <div
        data-expanded={expanded}
        className='fixed bottom-0 left-0 right-0 w-full h-[calc(50vh+60px)] bg-secondary translate-y-[50vh] transition-all data-[expanded=true]:translate-y-0'
      >
        <div className='cursor-pointer flex items-center justify-between h-[60px] px-6' onClick={toggleExpand}>
          <h6 className='font-bold text-medium text-primary'>{counts} Pending Transactions</h6>
          <Button
            data-expanded={expanded}
            isIconOnly
            size='sm'
            color='secondary'
            radius='full'
            className='bg-primary/5 data-[expanded=true]:rotate-180'
            onClick={toggleExpand}
          >
            <ExpandArrow />
          </Button>
        </div>
        <div className='h-[50vh] p-5 overflow-y-auto space-y-5'>
          {current && (
            <div>
              <h6 className='font-bold text-medium mb-2'>Next</h6>
              <div className='space-y-5'>
                <SafeTxCard
                  account={account}
                  key={`current-${current[0].toString()}`}
                  data={current[1]}
                  nonce={current[0]}
                />
              </div>
            </div>
          )}
          {Object.entries(queue).length > 0 && (
            <div>
              <h6 className='font-bold text-medium mb-2'>Queuing</h6>
              <div className='space-y-5'>
                {Object.entries(queue).map(([nonce, value]) => (
                  <SafeTxCard account={account} key={`queue-${nonce}`} data={value} nonce={BigInt(nonce)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(PendingTx);
