// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { Button } from '@mimir-wallet/components';
import { supportedChains } from '@mimir-wallet/config';

function Networks() {
  const chainId = useChainId();
  const chain = useMemo(() => supportedChains.find((item) => item.id === chainId), [chainId]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant='shadow'
          className='border-white border-2 bg-white bg-gradient-to-r from-black/[0.03] to-black/[0.06]'
          startContent={<Avatar src={chain?.iconUrl} className='w-[24px] h-[24px]' />}
          endContent={<ArrowDown />}
        >
          {chain?.name}
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {supportedChains.map((item) => (
          <DropdownItem
            href={`${window.location.pathname}?chainid=${item.id}`}
            startContent={<Avatar src={item?.iconUrl} className='w-[24px] h-[24px]' />}
            key={item.id}
          >
            {item.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default Networks;