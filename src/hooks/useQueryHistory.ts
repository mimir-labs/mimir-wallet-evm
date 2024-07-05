// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { serviceUrl } from '@mimir-wallet/config';

import { HistoryData, HistoryType } from './types';

type HistoryDataByDay = Record<string, HistoryData[]>;

export function useHistory(
  chainId: number,
  page = 1,
  limit = 20,
  address?: Address
): [
  HistoryDataByDay | undefined,
  { total?: number; page?: number; limit?: number; pageCount: number },
  isFetched: boolean,
  isFetching: boolean,
  isPlaceholderData: boolean,
  refetch: () => void
] {
  const { data, isFetched, isFetching, isPlaceholderData, refetch } = useQuery<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }>({
    queryHash: serviceUrl(chainId, `history/${address}?page=${page}&limit=${limit}`),
    queryKey: [address ? serviceUrl(chainId, `history/${address}?page=${page}&limit=${limit}`) : null],
    placeholderData: keepPreviousData
  });

  return useMemo(
    () => [
      data?.data
        .map((item): HistoryData => {
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
        })
        .reduce<HistoryDataByDay>((result, item) => {
          const dayStart = dayjs(item.time).startOf('days').valueOf();

          if (result[dayStart]) {
            result[dayStart].push(item);
          } else {
            result[dayStart] = [item];
          }

          return result;
        }, {}),
      { total: data?.total, page: data?.page, limit: data?.limit, pageCount: data?.pageCount || 1 },
      isFetched,
      isFetching,
      isPlaceholderData,
      refetch
    ],
    [data, isFetched, isFetching, isPlaceholderData, refetch]
  );
}
