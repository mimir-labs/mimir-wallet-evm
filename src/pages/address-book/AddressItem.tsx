// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody } from '@nextui-org/react';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import {
  Address as AddressComp,
  AddressCell,
  AddressIcon,
  AddressName,
  Button,
  CopyAddressButton
} from '@mimir-wallet/components';
import { useMediaQuery } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

function AddressItem({ address }: { address: Address }) {
  const { addAddressBook, addressNames } = useContext(AddressContext);
  const upSm = useMediaQuery('sm');

  const buttons = (
    <div className='flex sm:gap-5 gap-3'>
      <Button
        size={upSm ? 'md' : 'sm'}
        onClick={() => addAddressBook([address, addressNames[address] || ''])}
        color='primary'
        radius='full'
        fullWidth={upSm}
        variant='bordered'
      >
        Edit
      </Button>
      <Button
        size={upSm ? 'md' : 'sm'}
        as={Link}
        to={{
          pathname: `/apps/${encodeURIComponent(`mimir://app/transfer?receive=${address}&callbackPath=${encodeURIComponent('/address-book')}`)}`
        }}
        color='primary'
        radius='full'
        fullWidth={upSm}
      >
        Send
      </Button>
    </div>
  );

  if (!upSm) {
    return (
      <Card>
        <CardBody className='flex flex-col gap-4 p-4 text-medium [&_.address-cell-content-name]:text-lg [&.address-cell-content-address]:text-small'>
          <AddressCell iconSize={50} address={address} withCopy withExplorer />
          <div className='pl-[55px]'>{buttons}</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className='flex flex-row items-center gap-8 p-5 text-medium'>
        <h6 className='w-[30%] font-bold'>
          <AddressName address={address} />
        </h6>
        <div className='w-[50%] flex-1 flex items-center gap-1 text-foreground/50'>
          <AddressIcon size={30} address={address} />
          <AddressComp address={address} showFull />
          <CopyAddressButton address={address} color='primary' size='tiny' />
        </div>
        {buttons}
      </CardBody>
    </Card>
  );
}

export default React.memo(AddressItem);
