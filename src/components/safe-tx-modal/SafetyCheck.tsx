// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SafeTransaction } from '@mimir-wallet/safe/types';

import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { usePublicClient } from 'wagmi';

import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import IconWarning from '@mimir-wallet/assets/svg/icon-warning-fill.svg?react';
import { simulate } from '@mimir-wallet/safe';

import Button from '../Button';

function SafetyCheck({ tx, nonce, address }: { nonce?: bigint; tx: Omit<SafeTransaction, 'nonce'>; address: Address }) {
  const client = usePublicClient();

  const { isError, isIdle, isSuccess, isPending, mutate } = useMutation({
    mutationFn: async () => {
      if (!client || nonce === undefined) {
        throw new Error('Failed');
      }

      const result = await simulate(client, { ...tx, nonce }, address);

      if (!result[1]) {
        throw new Error('Failed');
      }
    }
  });

  return (
    <div>
      <h6 className='font-bold text-small'>Safety Check</h6>
      <div className='flex bg-secondary rounded-small p-2.5 mt-1 justify-between text-small'>
        <span className='font-bold'>Simulation</span>
        {isIdle || isPending ? (
          <Button
            isLoading={isPending}
            radius='full'
            color='primary'
            variant='bordered'
            size='sm'
            onClick={() => mutate()}
          >
            Simulate
          </Button>
        ) : isSuccess ? (
          <span className='flex items-center gap-x-1 text-success'>
            <IconSuccess />
            Success
          </span>
        ) : isError ? (
          <span className='flex items-center gap-x-1 text-danger'>
            <IconWarning />
            Failed
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default React.memo(SafetyCheck);
