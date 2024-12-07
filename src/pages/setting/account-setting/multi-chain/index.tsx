// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody, CircularProgress, Divider } from '@nextui-org/react';
import React, { useContext, useMemo } from 'react';

import { Alert } from '@mimir-wallet/components';
import { type CustomChain, supportedChains } from '@mimir-wallet/config';
import { useAccountCreatedInfo, useCurrentChain } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import ReplayChain from './ReplayChain';

function MultiChain({ name, safeAddress }: { name: string; safeAddress: Address }) {
  const [chainId] = useCurrentChain();
  const { multisigs } = useContext(AddressContext);

  const [replayParams, errorReason, isFetched, isFetching] = useAccountCreatedInfo(chainId, safeAddress);

  const multichainAccounts = useMemo(() => multisigs[safeAddress] || [], [safeAddress, multisigs]);
  const multisigChainsId = useMemo(
    () =>
      multichainAccounts
        .map((item) => supportedChains.find(({ id }) => id === item.chainId))
        .filter<CustomChain>((item): item is CustomChain => !!item)
        .map((item) => item.id),
    [multichainAccounts]
  );

  return (
    <div className='w-full'>
      <Card className='w-full'>
        <CardBody className='p-5 space-y-5'>
          <div>
            <h6 className='font-bold text-small'>Multi-Chain Deploy</h6>
            <p className='mt-2.5'>
              Mimir allows you to deploy the same multisig address across all chains supported by Mimir, facilitating
              various cross-chain asset interactions.
            </p>
          </div>

          <Alert
            severity='warning'
            title='Notice'
            content={
              <ul>
                <li>
                  Members and threshold settings will be created based on the initial members, not the current members
                </li>
              </ul>
            }
          />

          <Divider />

          {!isFetched && isFetching ? (
            <CircularProgress />
          ) : replayParams ? (
            <div className='bg-secondary p-2.5 space-y-2.5 rounded-medium'>
              {supportedChains.map((chain) => (
                <ReplayChain
                  name={name}
                  key={chain.id}
                  expectedAddress={safeAddress}
                  chain={chain}
                  factory={replayParams.factory}
                  singleton={replayParams.singleton}
                  data={replayParams.data}
                  deployedChainIds={multisigChainsId}
                />
              ))}
            </div>
          ) : (
            <Alert severity='error' title={errorReason} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(MultiChain);
