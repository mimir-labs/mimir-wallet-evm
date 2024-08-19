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
import { useSafeModules } from '@mimir-wallet/hooks';
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

  const isAllowance = moduleDeployments[chainId]?.Allowance?.includes(address);

  return (
    <div
      className='flex items-center justify-between gap-5 p-5 rounded-large'
      key={address}
      style={{ background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)' }}
    >
      <AddressCell
        withCopy
        showFull
        iconSize={50}
        name={isDelay ? 'Recovery' : isAllowance ? 'Easy Expense' : undefined}
        address={address}
        icon={isDelay ? RecoveryImg : isAllowance ? SpendLimitImg : undefined}
        className={'gap-x-5 '
          .concat(
            '[&_.address-cell-content-name]:text-medium [&_.address-cell-content-name]:leading-[20px] [&_.address-cell-content-name]:h-[20px] [&_.address-cell-content-name]:max-h-[20px] '
          )
          .concat(
            '[&_.address-cell-content-address]:text-small [&_.address-cell-content-name]:leading-[18px] [&_.address-cell-content-name]:h-[18px] [&_.address-cell-content-name]:max-h-[18px] '
          )}
      />

      <div className='flex items-center gap-5 font-bold'>
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
      <CardBody className='p-5 gap-2.5'>
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
