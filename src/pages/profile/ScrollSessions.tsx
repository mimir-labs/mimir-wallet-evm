// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Link } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Button } from '@mimir-wallet/components';

function ScrollSessions({ address }: { address: Address }) {
  const { data } = useQuery<Array<{ points: number }>>({
    queryKey: [`https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/scroll/wallet-points?walletAddress=${address}`]
  });

  const marks = useMemo(() => data?.map((item) => item.points).reduce((result, item) => result + item, 0), [data]);

  return (
    <div
      className='flex justify-between p-[20px] col-span-5 h-[155px] shadow-large rounded-[20px]'
      style={{
        background:
          "linear-gradient(90deg, #FFF0DD 23.28%, #FFF0DD 38%, rgba(255, 255, 255, 0.00) 100%), url('/images/scroll-sessions.webp') lightgray 50% / cover no-repeat"
      }}
    >
      <div>
        <h1 className='font-extrabold text-[40px] leading-tight text-[#FF684B]'>Scroll Sessions</h1>
        <h6 className='font-bold text-medium'>Your Marks</h6>
        <h1 className='font-extrabold text-[40px] leading-tight'>{marks?.toFixed(4) || 0}</h1>
      </div>
      <div className='self-end flex gap-2.5'>
        <Button as={Link} href='/apps' className='bg-[#FF684B]' radius='full' color='primary'>
          Try In Mimir
        </Button>
        <Button
          as='a'
          target='_blank'
          href='https://scroll.io/sessions'
          className='bg-[#FF684B]'
          radius='full'
          color='primary'
        >
          More with WalletConnect
        </Button>
      </div>
    </div>
  );
}

export default ScrollSessions;
