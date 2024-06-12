// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Divider, Link } from '@nextui-org/react';
import React from 'react';
import { useToggle } from 'react-use';
import { useBalance } from 'wagmi';

import IconSet from '@mimir-wallet/assets/svg/icon-set.svg?react';
import { Button, FormatBalance } from '@mimir-wallet/components';
import { formatDisplay } from '@mimir-wallet/components/FormatBalance';

import FundModal from './FundModal';

function Info({
  address,
  nftCounts,
  totalUsd,
  isSafe
}: {
  address: Address;
  totalUsd: string;
  nftCounts: number;
  isSafe: boolean;
}) {
  const { data } = useBalance({ address });
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <div className='space-y-5 h-full'>
        <div className='flex items-center gap-x-2 justify-between'>
          <h1 className='font-bold text-[40px] leading-[1]'>$ {formatDisplay(totalUsd)}</h1>
          {isSafe && (
            <Button as={Link} href='/setting?tab=account' size='sm' color='primary' variant='bordered' radius='full'>
              <IconSet />
            </Button>
          )}
        </div>
        <Divider />
        <div className='grid grid-cols-2 gap-5'>
          <div className='col-span-1'>
            <h6 className='text-small'>{data?.symbol}</h6>
            <h5 className='text-large font-bold'>
              <FormatBalance restOpacity={0.5} {...data} showSymbol={false} />
            </h5>
          </div>
          <div className='col-span-1'>
            <h6 className='text-small'>NFT</h6>
            <h5 className='text-large font-bold'>{nftCounts}</h5>
          </div>
          <div className='col-span-1 flex gap-2.5'>
            <Button
              as={Link}
              href={`/apps/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}`}
              variant='bordered'
              color='primary'
              radius='full'
              size='sm'
            >
              Transfer
            </Button>
            <Button onClick={toggleOpen} variant='bordered' color='primary' radius='full' size='sm'>
              Fund
            </Button>
          </div>
        </div>
      </div>

      <FundModal safeAddress={address} isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default React.memo(Info);
