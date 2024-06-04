// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { AddressOverview } from '@mimir-wallet/components';
import { useAllowanceTokens } from '@mimir-wallet/features/allowance';
import { useDelayModules } from '@mimir-wallet/features/delay';
import { useAccountNFTs, useAccountTokens, useQueryAccount, useVisibleApps } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

import Assets from './Assets';
import FavoriteApps from './FavoriteApps';
import Info from './Info';
import PendingTx from './PendingTx';
import Rules from './Rules';

function Dashboard({ address }: { address: Address }) {
  const { address: walletAccount } = useAccount();
  const account = useQueryAccount(address);
  const { favorites, isFavorite, removeFavorite, addFavorite } = useVisibleApps();
  const [data] = useAccountTokens(address);
  const [nftData] = useAccountNFTs(address);
  const [delayModules] = useDelayModules(address);
  const [allowanceTokens] = useAllowanceTokens(address);

  const allowanceInfo = useMemo(
    () =>
      walletAccount && allowanceTokens.length > 0
        ? allowanceTokens.find((item) => addressEq(item.delegate, walletAccount))
        : undefined,
    [allowanceTokens, walletAccount]
  );

  const recoveryInfo = useMemo(
    () =>
      walletAccount && delayModules.length > 0
        ? delayModules.find((item) => item.modules.findIndex((item) => addressEq(item, walletAccount)) > -1)
        : undefined,
    [walletAccount, delayModules]
  );

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
      {(recoveryInfo || allowanceInfo) && (
        <div className='col-span-5'>
          <h6 className='font-bold text-medium mb-2.5'>Rules</h6>
          <div>
            <Rules safeAccount={address} recoverer={recoveryInfo?.address} tokenAllowance={allowanceInfo} />
          </div>
        </div>
      )}
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
