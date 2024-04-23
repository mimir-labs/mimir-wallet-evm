// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Divider, Link } from '@nextui-org/react';
import React from 'react';
import { useBalance } from 'wagmi';

import IconSet from '@mimir-wallet/assets/svg/icon-set.svg?react';
import { Button, FormatBalance } from '@mimir-wallet/components';

function Info({ address }: { address: Address }) {
  const { data } = useBalance({ address, query: { refetchInterval: 14_000 } });

  return (
    <div className='space-y-5 h-full'>
      <div className='flex items-center gap-x-2 justify-between'>
        <h1 className='font-bold text-[40px] leading-[1]'>
          <FormatBalance
            prefix='$'
            value={data?.value}
            symbol={data?.symbol}
            showSymbol={false}
            decimals={data?.decimals}
            restOpacity={0.5}
          />
        </h1>
        <Button as={Link} href='/account-setting' size='sm' color='primary' variant='bordered' radius='full'>
          <IconSet />
        </Button>
      </div>
      <Divider />
      <div>
        <h6 className='text-small'>{data?.symbol}</h6>
        <h5 className='text-large font-bold'>
          <FormatBalance restOpacity={0.5} {...data} showSymbol={false} />
        </h5>
      </div>
      <div>
        <Button
          as={Link}
          href={`/apps/${encodeURIComponent('mimir://app/transfer')}`}
          variant='bordered'
          color='primary'
          radius='full'
        >
          Transfer
        </Button>
      </div>
    </div>
  );
}

export default React.memo(Info);
