// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody } from '@nextui-org/react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { Address, AddressIcon, AddressName, Button, CopyButton } from '@mimir-wallet/components';
import { AddressContext } from '@mimir-wallet/providers';

function AddressBook() {
  const { addAddressBook, addresses, addressNames } = useContext(AddressContext);

  return (
    <div>
      <Button onClick={() => addAddressBook()} color='primary' radius='full' variant='bordered'>
        Add New Address
      </Button>
      <div className='flex flex-col gap-y-5 mt-5'>
        {addresses.map((item) => (
          <Card key={item}>
            <CardBody className='flex flex-row items-center gap-8 p-5 text-medium'>
              <h6 className='w-[30%] font-bold'>
                <AddressName address={item} />
              </h6>
              <div className='w-[50%] flex-1 flex items-center gap-1 text-foreground/50'>
                <AddressIcon size={30} address={item} />
                <Address address={item} showFull />
                <CopyButton value={item} color='primary' size='tiny' />
              </div>
              <div className='flex gap-5'>
                <Button
                  onClick={() => addAddressBook([item, addressNames[item] || ''])}
                  color='primary'
                  radius='full'
                  fullWidth
                  variant='bordered'
                >
                  Edit
                </Button>
                <Button
                  as={Link}
                  to={{
                    pathname: `/apps/${encodeURIComponent(`mimir://app/transfer?receive=${item}&callbackPath=${encodeURIComponent('/address-book')}`)}`
                  }}
                  color='primary'
                  radius='full'
                  fullWidth
                >
                  Send
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AddressBook;
