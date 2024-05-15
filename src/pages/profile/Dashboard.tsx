// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody } from '@nextui-org/react';
import React from 'react';

import { AddressOverview } from '@mimir-wallet/components';
import { useAccountNFTs, useAccountTokens, useQueryAccount, useVisibleApps } from '@mimir-wallet/hooks';

import Assets from './Assets';
import FavoriteApps from './FavoriteApps';
import Info from './Info';
import PendingTx from './PendingTx';

function Dashboard({ address }: { address: Address }) {
  const account = useQueryAccount(address);
  const { favorites, isFavorite, removeFavorite, addFavorite } = useVisibleApps();
  const [data] = useAccountTokens(address);
  const [nftData] = useAccountNFTs(address);

  return (
    <div className='grid grid-cols-5 gap-4'>
      <div className='col-span-3'>
        <h6 className='font-bold text-medium mb-2.5'>Info</h6>
        <Card>
          <CardBody className='w-full h-[240px] p-4'>
            <Info
              isSafe={account?.type === 'safe'}
              nftCounts={nftData.assets.length}
              totalUsd={data.totalBalanceUsd}
              address={address}
            />
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
      {data.assets.length > 0 && (
        <div className='col-span-5'>
          <h6 className='font-bold text-medium mb-2.5'>Assets</h6>
          <Card>
            <CardBody className='w-full p-4'>
              <Assets assets={data.assets} />
            </CardBody>
          </Card>
        </div>
      )}
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
