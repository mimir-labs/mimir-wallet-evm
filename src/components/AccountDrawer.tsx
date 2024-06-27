// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Divider, Link } from '@nextui-org/react';
import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import IconMore from '@mimir-wallet/assets/svg/icon-more.svg?react';
import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import { useInput } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import AddressCell from './AddressCell';
import Button from './Button';
import ButtonLinear from './ButtonLinear';
import Drawer from './Drawer';
import Input from './Input';

function Cell({
  address,
  onSelect,
  children,
  onClose,
  isSelect
}: {
  address: Address;
  isSelect: boolean;
  onSelect?: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <Button
      data-selected={isSelect ? true : undefined}
      variant='bordered'
      fullWidth
      color='default'
      className='cursor-pointer flex items-center justify-between h-auto px-2.5 py-1.5 border-secondary text-left bg-white data-[selected=true]:bg-secondary'
      onClick={onSelect}
      endContent={
        isSelect ? null : (
          <Button
            as='div'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/setting?tab=account&settingAccount=${address}`);
              onClose();
            }}
            isIconOnly
            size='sm'
            className='p-0 min-w-0 min-h-0 w-6 h-6 border-none'
            variant='light'
          >
            <IconMore />
          </Button>
        )
      }
    >
      {children}
    </Button>
  );
}

function AccountDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { multisigs, isCurrent, switchAddress, current } = useContext(AddressContext);
  const [search, setSearch] = useInput();

  const filtered = useMemo(
    () =>
      multisigs.filter(
        (item) =>
          item.address.toLowerCase().includes(search.toLowerCase()) ||
          item.name?.toLowerCase().includes(search.toLowerCase())
      ),
    [multisigs, search]
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className='flex flex-col gap-5 w-[240px] h-full'>
        <div>
          <Input
            variant='bordered'
            placeholder='Search'
            labelPlacement='outside'
            endContent={<IconSearch className='text-foreground opacity-30' />}
            onChange={setSearch}
          />
        </div>
        <div className='flex-1 space-y-2.5 text-small max-h-[calc(100%-100px)] overflow-y-auto'>
          <p>Current Account</p>
          {current && (
            <Cell onClose={onClose} isSelect address={current}>
              <AddressCell withCopy iconSize={30} address={current} />
            </Cell>
          )}
          <Divider />
          <p>Multisig Accounts</p>
          {filtered.map((item) => (
            <Cell
              address={item.address}
              key={item.address}
              isSelect={isCurrent(item.address)}
              onSelect={() => {
                switchAddress(item.address);
                onClose();
              }}
              onClose={onClose}
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
        <ButtonLinear className='justify-self-end' as={Link} href='/create-multisig' size='lg' fullWidth radius='full'>
          Create Multisig
        </ButtonLinear>
      </div>
    </Drawer>
  );
}

export default React.memo(AccountDrawer);
