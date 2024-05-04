// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountAsset } from '@mimir-wallet/hooks/types';

import { Divider, Link } from '@nextui-org/react';
import React from 'react';

import IconSend from '@mimir-wallet/assets/svg/icon-send.svg?react';
import { AddressIcon, Button } from '@mimir-wallet/components';

function Assets({ assets }: { assets: AccountAsset[] }) {
  return (
    <div>
      {assets.map((asset, index) => (
        <React.Fragment key={asset.tokenAddress}>
          {index > 0 && <Divider className='my-5' />}
          <div className='flex items-center justify-between text-medium'>
            <div className='flex items-center gap-x-2 w-[30%]'>
              <AddressIcon isToken size={30} src={asset.icon || undefined} address={asset.tokenAddress} />
              {asset.symbol}
            </div>
            <div className='flex-1'>
              <b>{asset.balance}</b>
              <span className='text-foreground/50 ml-2.5'>$ {asset.balanceUsd}</span>
            </div>
            <Button
              as={Link}
              href={`/apps/${encodeURIComponent(`mimir://app/transfer?token=${asset.tokenAddress}`)}`}
              color='primary'
              radius='full'
              endContent={<IconSend color='white' />}
            >
              Transfer
            </Button>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default React.memo(Assets);
