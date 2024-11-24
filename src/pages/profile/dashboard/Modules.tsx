// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody, Link, Spinner } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useChainId, useChains } from 'wagmi';

import RecoveryImg from '@mimir-wallet/assets/images/recovery.svg';
import SpendLimitImg from '@mimir-wallet/assets/images/spend-limit.svg';
import { AddressCell, Empty } from '@mimir-wallet/components';
import { moduleDeployments } from '@mimir-wallet/config';
import { useDelayAddress } from '@mimir-wallet/features/delay';
import { DelayModuleResponse } from '@mimir-wallet/features/delay/types';
import { useMediaQuery, useSafeModules } from '@mimir-wallet/hooks';
import { addressEq, explorerUrl } from '@mimir-wallet/utils';

function Cell({
  address,
  delayAddress,
  moduleCounts
}: {
  address: Address;
  delayAddress: DelayModuleResponse[];
  moduleCounts?: Record<Address, number>;
}) {
  const chainId = useChainId();
  const [chain] = useChains();
  const isDelay = useMemo(
    () => !!delayAddress?.find((item) => addressEq(item.address, address)),
    [address, delayAddress]
  );
  const upSm = useMediaQuery('sm');

  const isAllowance = moduleDeployments[chainId]?.Allowance?.includes(address);

  return (
    <div
      className='flex items-center justify-between sm:gap-5 gap-2.5 sm:p-5 p-3 rounded-large'
      key={address}
      style={{ background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)' }}
    >
      <AddressCell
        withCopy
        showFull={upSm}
        iconSize={upSm ? 50 : 40}
        name={isDelay ? 'Recovery' : isAllowance ? 'Easy Expense' : undefined}
        address={address}
        icon={isDelay ? RecoveryImg : isAllowance ? SpendLimitImg : undefined}
        className={'sm:gap-x-5 gap-x-2.5 '
          .concat('sm:[&_.address-cell-content-name]:text-medium [&_.address-cell-content-name]:text-small ')
          .concat('sm:[&_.address-cell-content-address]:text-small [&_.address-cell-content-address]:text-tiny ')}
      />

      <div className='flex items-center sm:gap-5 gap-2.5 font-bold'>
        <span className='text-medium'>Tx {moduleCounts?.[address] || 0}</span>
        <Link isExternal href={explorerUrl('address', chain, address)}>
          {'Detail>'}
        </Link>
      </div>
    </div>
  );
}

function Modules({ safeAddress, moduleCounts }: { safeAddress: Address; moduleCounts?: Record<Address, number> }) {
  const [modules, isFetched, isFetching] = useSafeModules(safeAddress);
  const [delayAddress] = useDelayAddress(safeAddress);

  return (
    <Card>
      <CardBody className='sm:p-5 p-4 gap-2.5'>
        <h6 className='font-bold text-medium'>Modules</h6>

        {isFetched ? (
          modules.length > 0 ? (
            modules.map((address) => (
              <Cell key={address} address={address} delayAddress={delayAddress} moduleCounts={moduleCounts} />
            ))
          ) : (
            <Empty label='no modules' height={300} />
          )
        ) : isFetching ? (
          <Spinner />
        ) : null}
      </CardBody>
    </Card>
  );
}

export default React.memo(Modules);
