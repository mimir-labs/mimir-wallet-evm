// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/react';
import { useContext } from 'react';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { Button } from '@mimir-wallet/components';
import { supportedChains } from '@mimir-wallet/config';
import { useCurrentChain, useMediaQuery } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

const mains = supportedChains.filter((item) => !item.testnet);
const tests = supportedChains.filter((item) => !!item.testnet);

function Networks() {
  const [, chain] = useCurrentChain();
  const { switchAddress } = useContext(AddressContext);
  const upSm = useMediaQuery('sm');

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant='shadow'
          className='border-white border-2 bg-white bg-gradient-to-r from-black/[0.03] to-black/[0.06]'
          startContent={<Avatar src={chain?.iconUrl} className='w-[24px] h-[24px] bg-transparent' />}
          endContent={<ArrowDown />}
        >
          {upSm ? chain.name : ''}
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection title='' showDivider>
          {mains.map((item) => (
            <DropdownItem
              startContent={<Avatar src={item?.iconUrl} className='w-[24px] h-[24px] bg-transparent' />}
              key={item.id}
              onClick={() => {
                switchAddress(item.id);
              }}
            >
              {item.name}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title='Testnets'>
          {tests.map((item) => (
            <DropdownItem
              startContent={<Avatar src={item?.iconUrl} className='w-[24px] h-[24px] bg-transparent' />}
              key={item.id}
              onClick={() => {
                switchAddress(item.id);
              }}
            >
              {item.name}
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}

export default Networks;
