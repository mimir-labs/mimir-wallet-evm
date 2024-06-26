// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Simulation } from '../types';

import React from 'react';

import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import IconWarning from '@mimir-wallet/assets/svg/icon-warning-fill.svg?react';
import { Button } from '@mimir-wallet/components';

function SafetyCheck({ simulation }: { simulation: Simulation }) {
  return (
    <div>
      <h6 className='font-bold text-small'>Safety Check</h6>
      <div className='flex items-center bg-secondary rounded-small p-2.5 mt-1 justify-between text-small'>
        <div>
          <div className='font-bold'>Simulation</div>
          <div className='flex items-center gap-2.5'>
            <span className='text-foreground/50 text-small'>Power by</span>
            <img src='/images/tenderly.webp' alt='tenderly' width={80} />
          </div>
        </div>
        {simulation.isIdle || simulation.isPending ? (
          <Button isLoading={simulation.isPending} radius='full' color='primary' variant='bordered' size='sm'>
            Simulate
          </Button>
        ) : simulation.isSuccess ? (
          <span className='flex items-center gap-x-1 text-success'>
            <IconSuccess />
            Success
          </span>
        ) : simulation.isError ? (
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
