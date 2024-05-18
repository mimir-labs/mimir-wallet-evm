// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Link } from '@nextui-org/react';
import React, { useContext } from 'react';

import IconMore from '@mimir-wallet/assets/svg/icon-more.svg?react';
import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import { AddressContext } from '@mimir-wallet/providers';

import AddressCell from './AddressCell';
import Button from './Button';
import ButtonLinear from './ButtonLinear';
import Drawer from './Drawer';
import Input from './Input';

function Cell({
  onSelect,
  children,
  isSelect
}: {
  isSelect: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      data-selected={isSelect ? true : undefined}
      variant='bordered'
      fullWidth
      color='default'
      className='cursor-pointer flex items-center justify-between h-auto px-2.5 py-1.5 border-secondary text-left bg-white data-[selected=true]:bg-secondary'
      onClick={onSelect}
      endContent={
        <Button
          as='div'
          onClick={(e) => {
            e.stopPropagation();
          }}
          isIconOnly
          size='sm'
          className='p-0 min-w-0 min-h-0 w-6 h-6 border-none'
          variant='light'
        >
          <IconMore />
        </Button>
      }
    >
      {children}
    </Button>
  );
}

function AccountDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { multisigs, isCurrent, switchAddress, current } = useContext(AddressContext);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: ['w-[240px]', 'relative', 'pb-5']
      }}
    >
      <div className='p-2.5'>
        <Input
          variant='bordered'
          placeholder='Search'
          labelPlacement='outside'
          endContent={<IconSearch className='text-foreground opacity-30' />}
        />
      </div>
      <div className='flex-1 p-2.5 space-y-2.5 text-small max-h-[calc(100%-100px)] overflow-y-auto'>
        <p>Current Account</p>
        <Cell isSelect>
          <AddressCell withCopy iconSize={30} address={current} />
        </Cell>
        <Divider />
        <p>Multisig Accounts</p>
        {multisigs.map((item) => (
          <Cell
            key={item.address}
            isSelect={isCurrent(item.address)}
            onSelect={() => {
              switchAddress(item.address);
              onClose();
            }}
          >
            <AddressCell withCopy iconSize={30} address={item.address} fallbackName={item.name} />
          </Cell>
        ))}
        {/* <Divider />
        <p>Extension Accounts</p>
        {signers.map((item) => (
          <Cell
            key={item}
            isSelect={isCurrent(item)}
            onSelect={() => {
              switchAddress(item);
              onClose();
            }}
          >
            <AddressCell withCopy iconSize={30} address={item} />
          </Cell>
        ))} */}
      </div>
      <ButtonLinear
        className='mx-5 w-auto flex-shrink-0'
        as={Link}
        href='/create-multisig'
        size='lg'
        fullWidth
        radius='full'
      >
        Create Multisig
      </ButtonLinear>
    </Drawer>
  );
}

export default React.memo(AccountDrawer);
