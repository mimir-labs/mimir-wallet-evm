// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Card, Skeleton } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useChainId } from 'wagmi';

import { Empty, RecoveryTxCard, SafeTxCard } from '@mimir-wallet/components';
import { usePendingTransactions, useRecoveryTxs } from '@mimir-wallet/hooks';

function Pending({ account }: { account: BaseAccount }) {
  const chainId = useChainId();
  const [{ current, queue }, isFetchedTx, isFetchingTx, refetch] = usePendingTransactions(chainId, account.address);
  const [recoveryTxs, isFetchedRecovery, isFetchingRecovery] = useRecoveryTxs(chainId, account.address);

  const allPending = useMemo(() => {
    return (current ? [...current[1]] : []).concat(...Object.values(queue).flat());
  }, [current, queue]);

  const showSkeleton = (isFetchingTx || isFetchingRecovery) && (!isFetchedTx || !isFetchedRecovery);

  if (showSkeleton) {
    return (
      <div className='space-y-5'>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card className='space-y-5 p-4' radius='lg' key={index}>
            <Skeleton className='rounded-lg'>
              <div className='h-24 rounded-lg bg-default-300' />
            </Skeleton>
            <div className='space-y-3'>
              <Skeleton className='w-3/5 rounded-lg'>
                <div className='h-3 w-3/5 rounded-lg bg-default-200' />
              </Skeleton>
              <Skeleton className='w-4/5 rounded-lg'>
                <div className='h-3 w-4/5 rounded-lg bg-default-200' />
              </Skeleton>
              <Skeleton className='w-2/5 rounded-lg'>
                <div className='h-3 w-2/5 rounded-lg bg-default-300' />
              </Skeleton>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!current && Object.entries(queue).length === 0 && recoveryTxs.length === 0) {
    return <Empty height='80dvh' />;
  }

  return (
    <div className='space-y-5'>
      {recoveryTxs.map((tx) => (
        <div key={tx.id}>
          <h6 className='font-bold text-medium mb-2 text-primary'>Pending Recovery</h6>
          <div className='space-y-5'>
            <RecoveryTxCard refetch={refetch} pendingTxs={allPending} tx={tx} defaultOpen account={account} />
          </div>
        </div>
      ))}
      {current && (
        <div>
          <h6 className='font-bold text-medium mb-2'>Next</h6>
          <div className='space-y-5'>
            <SafeTxCard
              defaultOpen
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
  );
}

export default React.memo(Pending);
