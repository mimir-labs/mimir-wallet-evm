// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Hash } from 'viem';
import type { IPublicClient } from '@mimir-wallet/safe/types';

import { Link } from '@nextui-org/react';
import { toast } from 'react-toastify';

import { explorerUrl } from '@mimir-wallet/utils';

import { FailedAnimation, SuccessAnimation, WaitingAnimation } from '../animation';

export function waitTransaction(client: IPublicClient, hash: Hash) {
  const toastId = toast.warn(
    () => (
      <div className='ml-1.5'>
        <h6 className='font-bold text-medium'>Pending</h6>
        <p className='text-tiny'>Waiting for confirmations</p>
      </div>
    ),
    { autoClose: false, icon: <WaitingAnimation /> }
  );

  const { chain } = client;
  const explorer = chain.blockExplorers?.default;

  client
    .waitForTransactionReceipt({
      hash,
      retryCount: 30,
      onReplaced: ({ replacedTransaction }) => {
        toast.update(toastId, {
          autoClose: 3000,
          icon: <FailedAnimation />,
          render: () => (
            <div className='ml-1.5'>
              <h6 className='font-bold text-medium'>Replaced</h6>
              <p className='text-tiny'>
                <Link href={explorerUrl('tx', chain, replacedTransaction.hash)} isExternal className='text-tiny'>
                  New Transaction
                </Link>
              </p>
            </div>
          )
        });
      }
    })
    .then((receipt) => {
      if (receipt.status === 'success') {
        toast.update(toastId, {
          autoClose: 3000,
          icon: <SuccessAnimation />,
          type: 'success',
          render: () => (
            <div className='ml-1.5'>
              <h6 className='font-bold text-medium'>Success</h6>
              <p className='text-tiny'>
                <Link href='/transactions?tab=history' className='text-tiny'>
                  View Transaction
                </Link>
              </p>
            </div>
          )
        });
      } else {
        toast.update(toastId, {
          autoClose: 3000,
          icon: <FailedAnimation />,
          type: 'error',
          render: () => (
            <div className='ml-1.5'>
              <h6 className='font-bold text-medium'>Failed</h6>
              <p className='text-tiny'>
                <Link href={explorerUrl('tx', chain, hash)} isExternal className='text-tiny'>
                  View On {explorer?.name}
                </Link>
              </p>
            </div>
          )
        });
      }
    });
}
