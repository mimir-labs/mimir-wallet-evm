// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody } from '@nextui-org/react';
import React from 'react';
import { useChainId } from 'wagmi';

import { deployments } from '@mimir-wallet/config';
import { useSafeInfo } from '@mimir-wallet/hooks';

function Information({ safeAddress }: { safeAddress?: Address }) {
  const chainId = useChainId();
  const [data] = useSafeInfo(safeAddress);

  const deployment = deployments[chainId];

  if (!deployment || !safeAddress) {
    return null;
  }

  return (
    <div>
      <h6 className='font-bold mb-1 text-medium text-foreground/50'>Information</h6>
      <Card>
        <CardBody className='p-5 space-y-5 text-small'>
          <div>
            <p>
              <b>Current Nonce</b>
            </p>
            <div className='rounded-medium p-2.5 mt-1.5 bg-secondary'>{data?.[0].toString()}</div>
          </div>

          <div>
            <p>
              <b>Contract Version</b>
            </p>
            <div className='rounded-medium p-2.5 mt-1.5 bg-secondary'>{data?.[3].toString()}</div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(Information);
