// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import React, { useEffect } from 'react';
import { useToggle } from 'react-use';

import Batch from '@mimir-wallet/apps/batch';
import IconBatch from '@mimir-wallet/assets/svg/icon-batch.svg?react';
import { Drawer } from '@mimir-wallet/components';
import { events } from '@mimir-wallet/events';
import { useBatchTxs } from '@mimir-wallet/hooks';

function BatchButton({ address }: { address: Address }) {
  const [txs] = useBatchTxs(address);
  const [isOpen, toggleOpen] = useToggle(false);
  const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);

  useEffect(() => {
    const listener = (_: unknown, alert: boolean) => {
      if (alert) {
        toggleOpen(true);
      }
    };

    events.on('batch_tx_added', listener);

    return () => {
      events.off('batch_tx_added', listener);
    };
  }, [toggleOpen]);

  return (
    <>
      <Popover
        isOpen={isOpen}
        offset={20}
        shadow='lg'
        showArrow
        classNames={{ content: 'p-5' }}
        onOpenChange={(open) => {
          if (!open) {
            toggleOpen(open);
          }
        }}
      >
        <PopoverTrigger>
          <Button
            variant='bordered'
            isIconOnly
            className='border-1 border-secondary rounded-medium hover:bg-primary hover:text-primary-foreground'
            color='primary'
            onClick={toggleDrawerOpen}
          >
            <Badge
              isInvisible={txs.length === 0}
              content={txs.length}
              color='primary'
              placement='bottom-right'
              size='sm'
            >
              <IconBatch />
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className='flex items-center gap-2.5'>
            <IconBatch className='text-primary w-[32px] h-[32px]' />
            <span className='text-small'>New transaction has been added to Cache</span>
          </div>
        </PopoverContent>
      </Popover>

      <Drawer placement='right' isOpen={isDrawerOpen} onClose={() => toggleDrawerOpen(false)}>
        <div className='sm:p-5 p-4 h-full'>
          <Batch onClose={() => toggleDrawerOpen(false)} />
        </div>
      </Drawer>
    </>
  );
}

export default React.memo(BatchButton);
