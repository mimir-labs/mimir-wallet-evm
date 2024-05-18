// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse, TransactionResponse } from './types';

import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { service } from '@mimir-wallet/utils';

export type TransactionItem = { transaction: TransactionResponse; signatures: SignatureResponse[] };
export type PendingData = {
  current: [bigint, Array<TransactionItem>] | null;
  queue: Record<string, Array<TransactionItem>>;
};
export type HistoryData = Record<string, Record<string, Array<TransactionItem>>>; // day => nonce => item[]

const queryFn = async ({
  queryKey: [chainId, address, isHistory]
}: QueryFunctionContext<[chainId: number, address?: Address, isHistory?: boolean]>): Promise<Array<TransactionItem>> =>
  address
    ? service[isHistory ? 'historyTx' : 'pendingTx'](chainId, address).then((data) =>
        data.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => ({
            transaction: {
              ...item.transaction,
              value: BigInt(item.transaction.value),
              safeTxGas: BigInt(item.transaction.safeTxGas),
              baseGas: BigInt(item.transaction.baseGas),
              gasPrice: BigInt(item.transaction.gasPrice),
              nonce: BigInt(item.transaction.nonce),
              payment: BigInt(item.transaction.payment),
              executeBlock: item.transaction.executeBlock ? BigInt(item.transaction.executeBlock) : undefined,
              replaceBlock: item.transaction.replaceBlock ? BigInt(item.transaction.replaceBlock) : undefined
            },
            signatures: item.signatures
          })
        )
      )
    : [];

export function usePendingTransactions(
  chainId: number,
  address?: Address
): [PendingData, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { data, isFetched, isFetching, refetch } = useQuery({
    initialData: [],
    queryKey: [chainId, address, false],
    queryFn
  });

  return useMemo(
    () => [
      data.reduce<PendingData>(
        (result, value, index) => {
          if (result.current?.[0] === value.transaction.nonce || index === 0) {
            // current
            if (result.current) {
              result.current[1].push(value);
            } else {
              result.current = [value.transaction.nonce, [value]];
            }
          } else {
            const key = value.transaction.nonce.toString();

            if (result.queue[key]) {
              result.queue[key].push(value);
            } else {
              result.queue[key] = [value];
            }
          }

          return result;
        },
        { current: null, queue: {} }
      ),
      isFetched,
      isFetching,
      () => refetch()
    ],
    [data, isFetched, isFetching, refetch]
  );
}

export function useHistoryTransactions(
  chainId: number,
  address?: Address
): [HistoryData, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery({
    initialData: [],
    queryKey: [chainId, address, true],
    queryFn
  });

  return useMemo(
    () => [
      data.reduce<HistoryData>((result, value) => {
        const dayStart = dayjs(value.transaction.updatedAt).startOf('days').valueOf();
        const nonceKey = value.transaction.nonce.toString();

        if (result[dayStart]) {
          if (result[dayStart][nonceKey]) {
            result[dayStart][nonceKey].push(value);
          } else {
            result[dayStart][nonceKey] = [value];
          }
        } else {
          result[dayStart] = {
            [nonceKey]: [value]
          };
        }

        return result;
      }, {}),
      isFetched,
      isFetching
    ],
    [data, isFetched, isFetching]
  );
}
