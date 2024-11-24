// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Divider, Link } from '@nextui-org/react';
import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconMore from '@mimir-wallet/assets/svg/icon-more.svg?react';
import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import { useInput, useMediaQuery } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import AddressCell from './AddressCell';
import Button from './Button';
import ButtonLinear from './ButtonLinear';
import Drawer from './Drawer';
import Input from './Input';

function Cell({
  address,
  onSelect,
  isWatchOnly,
  children,
  onClose,
  isSelect
}: {
  address: Address;
  isSelect: boolean;
  isWatchOnly: boolean;
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
        isSelect ? null : isWatchOnly ? null : (
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
  const { multisigs, isCurrent, switchAddress, watchOnlyList, addWatchOnlyList, current } = useContext(AddressContext);
  const [search, setSearch] = useInput();
  const upSm = useMediaQuery('sm');

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
    <Drawer rounded placement={upSm ? 'left' : 'right'} isOpen={isOpen} onClose={onClose}>
      <div className='flex flex-col gap-5 w-[300px] h-full'>
        <div className='z-[1] absolute top-0 left-0 w-full px-4 py-4 bg-background'>
          <Input
            variant='bordered'
            placeholder='Search'
            labelPlacement='outside'
            endContent={<IconSearch className='text-foreground opacity-30' />}
            onChange={setSearch}
          />
        </div>

        <div className='flex-1 space-y-2.5 text-small pt-20 pb-8 px-4 overflow-y-auto'>
          {current && <p>Current Account</p>}
          {current && (
            <Cell isWatchOnly={false} onClose={onClose} isSelect address={current}>
              <AddressCell withCopy iconSize={30} address={current} />
            </Cell>
          )}

          {current && <Divider />}
          {filtered.length > 0 && <p>Multisig Accounts</p>}
          {filtered.map((item) => (
            <Cell
              isWatchOnly={false}
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

          <Divider />
          <p className='flex items-center justify-between'>
            Watch List
            <Button size='tiny' radius='full' variant='light' isIconOnly onClick={() => addWatchOnlyList()}>
              <IconAdd style={{ width: 12, height: 12 }} />
            </Button>
          </p>
          {watchOnlyList.map((address) => (
            <Cell
              isWatchOnly
              address={address}
              key={address}
              isSelect={isCurrent(address)}
              onSelect={() => {
                switchAddress(address);
                onClose();
              }}
              onClose={onClose}
            >
              <AddressCell withCopy iconSize={30} address={address} />
            </Cell>
          ))}
        </div>

        <div className='z-[1] absolute bottom-0 left-0 w-full px-4 py-4 bg-background'>
          <ButtonLinear
            className='justify-self-end'
            as={Link}
            href='/create-multisig'
            size='lg'
            fullWidth
            radius='full'
            onClick={onClose}
          >
            Create Multisig
          </ButtonLinear>
        </div>
      </div>
    </Drawer>
  );
}

export default React.memo(AccountDrawer);
