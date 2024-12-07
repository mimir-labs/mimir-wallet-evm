// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Skeleton
} from '@nextui-org/react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIntersection, useToggle } from 'react-use';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconMore from '@mimir-wallet/assets/svg/icon-more.svg?react';
import IconSearch from '@mimir-wallet/assets/svg/icon-search.svg?react';
import { useAccountTotalUsd, useCurrentChain, useInput, useMediaQuery, useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

import AddressCell from './AddressCell';
import Button from './Button';
import ButtonLinear from './ButtonLinear';
import Drawer from './Drawer';
import { formatDisplay } from './FormatBalance';
import Input from './Input';

function TotalBalanceDisplay({
  totalUsd,
  isFetched,
  isFetching
}: {
  totalUsd: string;
  isFetched: boolean;
  isFetching: boolean;
}) {
  const [major, rest] = formatDisplay(totalUsd, 2);

  return (
    <div className='flex-grow-[1] flex justify-center'>
      {isFetching && !isFetched ? (
        <Skeleton className='w-10 h-4 rounded-small' />
      ) : (
        <span className='text-tiny font-bold'>
          $ {major}
          {rest ? `.${rest}` : null}
        </span>
      )}
    </div>
  );
}

function ChainIcon({ chainId }: { chainId: number }) {
  const [, , , , chains] = useCurrentChain();
  const chain = chains.find((item) => item.id === chainId);

  return <Avatar style={{ width: 16, height: 16 }} src={chain?.iconUrl} />;
}

function Cell({
  address,
  supportedChains,
  isWatchOnly,
  canSelect,
  onClose,
  isSelect
}: {
  address: Address;
  supportedChains: number[];
  isSelect: boolean;
  isWatchOnly: boolean;
  canSelect: boolean;
  onClose: () => void;
}) {
  const [currentChainId, currentChain] = useCurrentChain();
  const { switchAddress } = useContext(AddressContext);
  const [isOpen, toggleOpen] = useToggle(!!isSelect);
  const ref = useRef<HTMLDivElement>(null);
  const [enable, setEnable] = useState(false);
  const entry = useIntersection(ref, { rootMargin: '30px' });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setEnable(true);
    }
  }, [entry?.isIntersecting]);

  const [[usdPerChain, totalUsd], isFetched, isFetching] = useAccountTotalUsd(address, enable);

  // const multichainAccounts = useMemo(() => multisigs[address] || [], [address, multisigs]);

  // const multisigChains = useMemo(
  //   () =>
  //     multichainAccounts
  //       .map((item) => supportedChains.find(({ id }) => id === item.chainId))
  //       .filter<CustomChain>((item): item is CustomChain => !!item),
  //   [multichainAccounts]
  // );

  const handleClick = useCallback(
    (chainId: number) => {
      switchAddress(chainId, address);
      onClose();
    },
    [address, onClose, switchAddress]
  );

  const action = isWatchOnly ? null : (
    <Dropdown placement='bottom-end'>
      <DropdownTrigger>
        <Button isIconOnly radius='full' size='sm' className='p-0 min-w-0 min-h-0 w-6 h-6 border-none' variant='light'>
          <IconMore />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onClick={onClose} href={`/setting?tab=account&address=${address}&chainid=${supportedChains[0]}`}>
          Setting
        </DropdownItem>
        <DropdownItem
          onClick={onClose}
          href={`/setting?tab=account&address=${address}&chainid=${supportedChains[0]}&accountTab=multi-chain`}
        >
          Add Network
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  return (
    <div
      ref={ref}
      data-selected={isSelect ? true : undefined}
      data-open={!!isOpen}
      className='rounded-medium bg-background data-[selected=true]:bg-secondary data-[open=true]:bg-secondary'
    >
      <div
        className='cursor-pointer flex items-center justify-between gap-2 h-auto px-2.5 py-1.5 border-1 border-primary/5 rounded-medium'
        onClick={
          canSelect ? (supportedChains.length === 1 ? () => handleClick(supportedChains[0]) : toggleOpen) : undefined
        }
      >
        <AddressCell disableEip3770 chainId={currentChain.id} withCopy iconSize={30} address={address} />

        <TotalBalanceDisplay totalUsd={totalUsd} isFetched={isFetched} isFetching={isFetching} />

        <div className='flex items-center gap-x-1'>
          {supportedChains.map((chainId) => (
            <ChainIcon key={chainId} chainId={chainId} />
          ))}
        </div>

        {action}
      </div>

      {canSelect && supportedChains.length > 1 && isOpen && (
        <div className='p-2.5 space-y-2.5'>
          {supportedChains.map((chainId) => (
            <div
              data-selected={isSelect && currentChainId === chainId ? true : undefined}
              key={chainId}
              className='cursor-pointer flex items-center justify-between gap-2 h-auto px-2.5 py-1.5 bg-background rounded-medium border-1 border-l-4 data-[selected=true]:border-primary/50 data-[selected=true]:shadow-m'
              onClick={canSelect ? () => handleClick(chainId) : undefined}
            >
              <AddressCell withCopy={false} iconSize={30} address={address} chainId={chainId} />

              <TotalBalanceDisplay
                totalUsd={usdPerChain[chainId] || '0'}
                isFetched={isFetched}
                isFetching={isFetching}
              />

              <ChainIcon chainId={chainId} />
            </div>
          ))}

          <Button
            as={Link}
            color='primary'
            fullWidth
            radius='full'
            variant='bordered'
            href={`/setting?tab=account&address=${address}&chainid=${supportedChains[0]}&accountTab=multi-chain`}
            onClick={onClose}
          >
            Add Network
          </Button>
        </div>
      )}
    </div>
  );
}

function AccountDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addWatchOnlyList, current, multisigs, watchlist } = useContext(AddressContext);
  const [search, setSearch] = useInput();
  const upSm = useMediaQuery('sm');
  const [currentChainId] = useCurrentChain();
  const currentAccount = useQueryAccount(current);

  const filteredMultisigs = useMemo((): Record<Address, number[]> => {
    return Object.values(multisigs)
      .flat()
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.address.toLowerCase().includes(search.toLowerCase())
      )
      .reduce<Record<Address, number[]>>((results, item) => {
        results[item.address] = [...(results[item.address] || []), item.chainId];

        return results;
      }, {});
  }, [multisigs, search]);

  const filteredWatchlist = useMemo((): Record<Address, number[]> => {
    return Object.values(watchlist)
      .flat()
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.address.toLowerCase().includes(search.toLowerCase())
      )
      .reduce<Record<Address, number[]>>((results, item) => {
        results[item.address] = [...(results[item.address] || []), item.chainId];

        return results;
      }, {});
  }, [watchlist, search]);

  return (
    <Drawer rounded placement={upSm ? 'left' : 'right'} isOpen={isOpen} onClose={onClose}>
      <div className='flex flex-col gap-5 sm:w-[390px] w-[330px] h-full'>
        <div className='z-[1] absolute top-0 left-0 w-full p-2.5 bg-background'>
          <Input
            variant='bordered'
            placeholder='Search'
            labelPlacement='outside'
            endContent={<IconSearch className='text-foreground opacity-30' />}
            onChange={setSearch}
          />
        </div>

        <div className='flex-1 space-y-2.5 text-small pt-[64px] pb-[72px] px-2.5 overflow-y-auto'>
          {current && <p>Current Account</p>}
          {current && (
            <Cell
              isWatchOnly={false}
              canSelect={false}
              onClose={onClose}
              isSelect
              address={current as Address}
              supportedChains={currentAccount?.supportedChains || [currentChainId]}
            />
          )}
          {current && <Divider />}

          {Object.keys(filteredMultisigs).length > 0 && <p>Multisig Accounts</p>}
          {Object.entries(filteredMultisigs).map(([address, chainIds]) => (
            <Cell
              isWatchOnly={false}
              address={address as Address}
              supportedChains={chainIds}
              key={address}
              isSelect={addressEq(address, current)}
              canSelect
              onClose={onClose}
            />
          ))}
          {Object.keys(filteredMultisigs).length > 0 && <Divider />}

          <p className='flex items-center justify-between'>
            Watch List
            <Button size='tiny' radius='full' variant='light' isIconOnly onClick={() => addWatchOnlyList()}>
              <IconAdd style={{ width: 12, height: 12 }} />
            </Button>
          </p>
          {Object.entries(filteredWatchlist).map(([address, chainIds]) => (
            <Cell
              isWatchOnly
              address={address as Address}
              supportedChains={chainIds}
              key={address}
              isSelect={addressEq(address, current)}
              canSelect
              onClose={onClose}
            />
          ))}
        </div>

        <div className='z-[1] absolute bottom-0 left-0 w-full p-2.5 bg-background'>
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
