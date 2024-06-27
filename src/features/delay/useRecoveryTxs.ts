// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { RecoveryTx } from './types';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { serviceUrl } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';

export function useRecoveryTxs(
  chainId: number,
  address?: Address
): [RecoveryTx[], isFetched: boolean, isFetching: boolean] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isFetched, isFetching } = useQuery<any[]>({
    initialData: EmptyArray,
    queryHash: serviceUrl(chainId, `tx/recovery/${address}`),
    queryKey: [address ? serviceUrl(chainId, `tx/recovery/${address}`) : null]
  });

  return useMemo(
    () => [
      data.map((item) => ({
        address: item.address,
        block: BigInt(item.block),
        createdAt: Number(item.createdAt),
        data: item.data,
        id: item.id,
        operation: item.operation,
        queueNonce: BigInt(item.queueNonce),
        sender: item.sender,
        to: item.to,
        transaction: item.transaction,
        txHash: item.txHash,
        value: BigInt(item.value)
      })),
      isFetched,
      isFetching
    ],
    [data, isFetched, isFetching]
  );
}
