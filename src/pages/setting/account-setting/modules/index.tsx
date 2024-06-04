// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody, Divider, Link, Spinner } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { getAddress, sliceHex } from 'viem';
import { useStorageAt } from 'wagmi';

import { AddressCell, Empty } from '@mimir-wallet/components';
import { FALLBACK_HANDLER_STORAGE_SLOT } from '@mimir-wallet/constants';
import { useSafeModules } from '@mimir-wallet/hooks';

import ModuleItem from './ModuleItem';

function Modules({ safeAddress }: { safeAddress: Address }) {
  const [modules, isFetched, isFetching] = useSafeModules(safeAddress);
  const { data } = useStorageAt({
    address: safeAddress,
    slot: FALLBACK_HANDLER_STORAGE_SLOT
  });

  const fallback = useMemo(() => {
    try {
      return data ? getAddress(sliceHex(data, 12, 32)) : null;
    } catch {
      return null;
    }
  }, [data]);

  return (
    <div className='w-full'>
      <Card className='w-full'>
        <CardBody className='p-5 space-y-5'>
          <div>
            <h6 className='font-bold text-small'>Multisig Account Modules</h6>
            <p className='mt-2.5'>
              Modules allow you to customize the access-control logic of your Multisig Account. Modules are potentially
              risky, so make sure to only use modules from trusted sources. Learn more about modules{' '}
              <Link showAnchorIcon href='https://github.com/5afe/safe-core-protocol' isExternal>
                here
              </Link>
              .
            </p>
          </div>

          <div className='bg-secondary rounded-medium p-2.5 space-y-2.5'>
            {isFetching && !isFetched ? (
              <Spinner />
            ) : isFetched && modules.length === 0 ? (
              <Empty height={200} label='No modules enabled' />
            ) : (
              modules.map((item) => <ModuleItem safeAddress={safeAddress} moduleAddress={item} key={item} />)
            )}
          </div>

          <Divider />

          <div>
            <h6 className='font-bold text-small'>Fallback handler</h6>
            <p className='mt-2.5'>
              The fallback handler adds fallback logic for funtionality that may not be present in the Safe Account
              contract. Learn more about the fallback handler{' '}
              <Link
                showAnchorIcon
                href='https://help.safe.global/en/articles/40838-what-is-a-fallback-handler-and-how-does-it-relate-to-safe'
                isExternal
              >
                here
              </Link>
              .
            </p>
          </div>

          {fallback && (
            <div className='bg-secondary rounded-medium p-2.5'>
              <AddressCell withCopy withExplorer address={fallback} showFull />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(Modules);
