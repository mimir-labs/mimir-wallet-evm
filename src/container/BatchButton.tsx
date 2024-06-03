// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import React, { useContext, useEffect } from 'react';
import { useToggle } from 'react-use';

import Batch from '@mimir-wallet/apps/batch';
import IconBatch from '@mimir-wallet/assets/svg/icon-batch.svg?react';
import { Drawer } from '@mimir-wallet/components';
import { events } from '@mimir-wallet/events';
import { useBatchTxs } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

function BatchButton() {
  const { current } = useContext(AddressContext);
  const [txs] = useBatchTxs(current);
  const [isOpen, toggleOpen] = useToggle(false);
  const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);

  useEffect(() => {
    const listener = () => {
      toggleOpen(true);
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
            className='border-1 border-secondary'
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
            <span className='text-small'>New transaction has been added to Batch</span>
          </div>
        </PopoverContent>
      </Popover>

      <Drawer placement='right' isOpen={isDrawerOpen} onClose={() => toggleDrawerOpen(false)}>
        <Batch onClose={() => toggleDrawerOpen(false)} />
      </Drawer>
    </>
  );
}

export default React.memo(BatchButton);
