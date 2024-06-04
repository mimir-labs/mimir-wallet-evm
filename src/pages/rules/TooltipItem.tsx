// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tooltip } from '@nextui-org/react';
import React from 'react';

import IconQuestion from '@mimir-wallet/assets/svg/icon-question.svg?react';

function TooltipItem({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className='flex gap-1.5 items-center'>
      {children}
      <Tooltip
        classNames={{ content: 'max-w-[300px]' }}
        closeDelay={0}
        content={content}
        placement='top'
        showArrow
        color='foreground'
      >
        <div>
          <IconQuestion className='text-foreground/20' style={{ width: 12, height: 12 }} />
        </div>
      </Tooltip>
    </div>
  );
}

export default TooltipItem;
