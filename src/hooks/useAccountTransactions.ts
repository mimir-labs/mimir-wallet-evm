// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse, TransactionResponse } from './types';

import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { service } from '@mimir-wallet/utils';

type Item = { transaction: TransactionResponse; signatures: SignatureResponse[] };
type PendingData = { current: [bigint, Array<Item>] | null; queue: Record<string, Array<Item>> };
type HistoryData = Record<string, Array<Item>>;

const queryFn = async ({
  queryKey: [chainId, address, nonce, isHistory]
}: QueryFunctionContext<
  [chainId: number, address?: Address, nonce?: bigint | number | string, isHistory?: boolean]
>): Promise<Array<Item>> =>
  address && nonce !== undefined && nonce !== null
    ? service[isHistory ? 'historyTx' : 'pendingTx'](chainId, address, nonce).then((data) =>
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
  address?: Address,
  nonce?: bigint
): [PendingData, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery({
    initialData: [],
    queryKey: [chainId, address, nonce?.toString(), false],
    queryFn
  });

  return useMemo(
    () => [
      data.reduce<PendingData>(
        (result, value) => {
          if (value.transaction.nonce === nonce) {
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
      isFetching
    ],
    [data, isFetched, isFetching, nonce]
  );
}

export function useHistoryTransactions(
  chainId: number,
  address?: Address,
  nonce?: bigint
): [HistoryData, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery({
    initialData: [],
    queryKey: [chainId, address, nonce?.toString(), true],
    queryFn
  });

  return useMemo(
    () => [
      data.reduce<HistoryData>((result, value) => {
        const key = value.transaction.nonce.toString();

        if (result[key]) {
          result[key].push(value);
        } else {
          result[key] = [value];
        }

        return result;
      }, {}),
      isFetched,
      isFetching
    ],
    [data, isFetched, isFetching]
  );
}
