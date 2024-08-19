// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { serviceUrl } from '@mimir-wallet/config';
import { fetcher } from '@mimir-wallet/utils/fetcher';

import { HistoryData, HistoryType } from './types';

export function useHistory(
  chainId: number,
  limit = 20,
  address?: Address,
  type?: HistoryType,
  startTime?: number,
  endTime?: number,
  to?: string,
  module?: string,
  token?: string
): [
  HistoryData[] | undefined,
  isFetched: boolean,
  isFetching: boolean,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void
] {
  let filters = '';

  if (type !== undefined && type !== null) {
    filters += `&type=${type}`;
  }

  if (startTime) {
    filters += `&start=${startTime}`;
  }

  if (endTime) {
    filters += `&end=${endTime}`;
  }

  if (to) {
    filters += `&to=${to}`;
  }

  if (token) {
    filters += `&token=${token}`;
  }

  if (module) {
    filters += `&module=${module}`;
  }

  const { data, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage } = useInfiniteQuery<any[]>({
    initialPageParam: null,
    queryKey: [address ? serviceUrl(chainId, `history/${address}?limit=${limit}${filters}`) : null],
    queryFn: async ({ pageParam, queryKey }) => {
      if (!queryKey[0]) {
        return undefined;
      }

      return fetcher(pageParam ? `${queryKey[0]}&next_cursor=${pageParam}` : `${queryKey[0]}`);
    },
    getNextPageParam: (data, allPages) => {
      if (allPages.length === 20) {
        return null;
      }

      if (data.length) {
        return data.length === limit ? data[data.length - 1].id : null;
      }

      return null;
    },
    maxPages: 20,
    refetchInterval: 0
  });

  return useMemo(
    () => [
      data?.pages.flat().map((item): HistoryData => {
        if (item.type === HistoryType.SafeTx) {
          return {
            ...item,
            data: {
              ...item.data,
              transaction: {
                ...item.data.transaction,
                value: BigInt(item.data.transaction.value),
                safeTxGas: BigInt(item.data.transaction.safeTxGas),
                baseGas: BigInt(item.data.transaction.baseGas),
                gasPrice: BigInt(item.data.transaction.gasPrice),
                nonce: BigInt(item.data.transaction.nonce),
                payment: BigInt(item.data.transaction.payment),
                executeBlock: item.data.transaction.executeBlock
                  ? BigInt(item.data.transaction.executeBlock)
                  : undefined,
                replaceBlock: item.data.transaction.replaceBlock
                  ? BigInt(item.data.transaction.replaceBlock)
                  : undefined
              }
            }
          };
        }

        if (item.type === HistoryType.ModuleTx) {
          return {
            ...item,
            data: {
              ...item.data,
              value: BigInt(item.data.value),
              block: BigInt(item.data.block)
            }
          };
        }

        return {
          ...item,
          data: {
            ...item.data,
            block: BigInt(item.data.block),
            value: BigInt(item.data.value)
          }
        };
      }),
      isFetched,
      isFetching,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage
    ],
    [data?.pages, fetchNextPage, hasNextPage, isFetched, isFetching, isFetchingNextPage]
  );
}
