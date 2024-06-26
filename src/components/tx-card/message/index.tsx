// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageSignature } from '@mimir-wallet/hooks';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Card, CardBody } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { memberPaths } from '@mimir-wallet/safe';

import Cell from './Cell';

interface Props {
  account?: BaseAccount | null;
  defaultOpen?: boolean;
  data: MessageSignature;
}

function SafeMessageCard({ account, defaultOpen, data }: Props) {
  const { address } = useAccount();

  const allPaths = useMemo(() => (account && address ? memberPaths(account, address) : []), [account, address]);

  return (
    <Card>
      {account ? (
        <CardBody className='space-y-3'>
          <Cell
            account={account}
            allPaths={allPaths}
            defaultOpen={defaultOpen}
            message={data.message}
            signatures={data.signatures}
          />
        </CardBody>
      ) : null}
    </Card>
  );
}

export default React.memo(SafeMessageCard);
