// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Accordion, AccordionItem, Progress } from '@nextui-org/react';
import React from 'react';

import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import AddressCell from '@mimir-wallet/components/AddressCell';
import ButtonEnable from '@mimir-wallet/components/ButtonEnable';

function Process({
  sender,
  createdAt,
  cooldown,
  handleCancel,
  handleExecute
}: {
  sender: Address;
  createdAt: number;
  cooldown?: number;
  handleCancel: (wallet: IWalletClient, client: IPublicClient) => void;
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => void;
}) {
  const now = Date.now();

  return (
    <div className='w-[24%] rounded-medium bg-primary/[0.04] p-3 space-y-2'>
      <h6 className='text-primary font-bold text-medium'>Process</h6>
      <Accordion defaultSelectedKeys='all' className='px-0'>
        <AccordionItem
          indicator={<ArrowLeft />}
          isCompact
          classNames={{
            titleWrapper: ['py-0'],
            title: ['py-0 text-small font-bold flex justify-between'],
            content: 'p-0 pb-2 space-y-2'
          }}
          key='1'
          aria-label='Recoverer'
          title='Recoverer'
        >
          <div className='rounded-medium bg-primary/5 p-[5px]'>
            <AddressCell iconSize={30} withCopy address={sender} />
            <div className='px-[40px]'>
              <Progress
                className='h-[3px]'
                size='sm'
                value={cooldown === undefined ? createdAt : now}
                maxValue={createdAt + (cooldown || 0)}
                minValue={createdAt}
                color='primary'
              />
            </div>
          </div>
        </AccordionItem>
      </Accordion>
      <div className='flex items-center gap-x-4'>
        <ButtonEnable onClick={handleCancel} fullWidth radius='full' color='primary' variant='bordered'>
          Cancel
        </ButtonEnable>
        {cooldown && now > createdAt + cooldown && (
          <ButtonEnable isToastError onClick={handleExecute} fullWidth radius='full' color='primary'>
            Execute
          </ButtonEnable>
        )}
      </div>
    </div>
  );
}

export default React.memo(Process);
