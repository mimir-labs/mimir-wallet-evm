// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { Button, Empty } from '@mimir-wallet/components';
import { AddressContext } from '@mimir-wallet/providers';

import AddressItem from './AddressItem';
import Export from './Export';
import Import from './Import';

function AddressBook() {
  const { addAddressBook, addresses } = useContext(AddressContext);

  return (
    <div>
      <div className='flex justify-between gap-x-2.5'>
        <Button onClick={() => addAddressBook()} color='primary' radius='full' variant='bordered'>
          Add New Address
        </Button>
        <div className='flex-grow-[1]' />
        <Import />
        <Export />
      </div>
      <div className='flex flex-col gap-y-5 mt-5'>
        {addresses.length > 0 ? (
          addresses.map((item) => <AddressItem key={item} address={item} />)
        ) : (
          <Empty height='80vh' />
        )}
      </div>
    </div>
  );
}

export default AddressBook;
