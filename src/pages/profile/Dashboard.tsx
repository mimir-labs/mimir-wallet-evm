// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody } from '@nextui-org/react';
import React from 'react';

import { AddressOverview } from '@mimir-wallet/components';
import { useQueryAccount, useVisibleApps } from '@mimir-wallet/hooks';

import FavoriteApps from './FavoriteApps';
import Info from './Info';
import PendingTx from './PendingTx';

function Dashboard({ address }: { address: Address }) {
  const account = useQueryAccount(address);
  const { favorites, isFavorite, removeFavorite, addFavorite } = useVisibleApps();

  return (
    <div className='grid grid-cols-5 gap-4'>
      <div className='col-span-3'>
        <h6 className='font-bold text-medium mb-2.5'>Info</h6>
        <Card>
          <CardBody className='w-full h-[240px] p-4'>
            <Info address={address} />
          </CardBody>
        </Card>
      </div>
      <div className='col-span-2'>
        <h6 className='font-bold text-medium mb-2.5'>Pending Transaction</h6>
        <Card>
          <CardBody className='w-full h-[240px] p-4'>
            <PendingTx address={address} />
          </CardBody>
        </Card>
      </div>
      {/* <div className='col-span-5'>
        <h6 className='font-bold text-medium mb-2.5'>Assets</h6>
        <Card>
          <CardBody className='w-full h-[300px] p-4' />
        </Card>
      </div> */}
      {favorites.length > 0 && (
        <div className='col-span-5'>
          <h6 className='font-bold text-medium mb-2.5'>Favourite Apps</h6>
          <div>
            <FavoriteApps
              favorites={favorites}
              isFavorite={isFavorite}
              removeFavorite={removeFavorite}
              addFavorite={addFavorite}
            />
          </div>
        </div>
      )}
      <div className='col-span-5'>
        <h6 className='font-bold text-medium mb-2.5'>Members</h6>
        <Card>
          <CardBody className='w-full h-[50vh] p-4'>
            {account && <AddressOverview key={account.address} account={account} />}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default React.memo(Dashboard);
