// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type {
  AllowanceTransactionResponse,
  ModuleTransactionResponse,
  ReceivedResponse,
  SignatureResponse,
  TransactionResponse
} from './types';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Hash } from 'viem';

import { serviceUrl } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';

export type TransactionSignature = {
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
};

export type PendingData = {
  current: [bigint, Array<TransactionSignature>] | null;
  queue: Record<string, Array<TransactionSignature>>;
};

export type HistoryItem =
  | { type: 'safe-tx'; data: TransactionSignature }
  | { type: 'safe-module-tx'; data: ModuleTransactionResponse }
  | { type: 'allowance-tx'; data: AllowanceTransactionResponse }
  | { type: 'received-tx'; data: ReceivedResponse };

export type HistoryData = Record<string, Array<HistoryItem>>; // day => item[]

export function usePendingTransactions(
  chainId: number,
  address?: Address
): [PendingData, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { data, isFetched, isFetching, refetch } = useQuery<any[]>({
    initialData: EmptyArray,
    queryKey: [address ? serviceUrl(chainId, `tx/pending/${address}`) : null]
  });

  return useMemo(
    () => [
      data
        .map(
          (item): TransactionSignature => ({
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
        .reduce<PendingData>(
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
      refetch
    ],
    [data, isFetched, isFetching, refetch]
  );
}

function extraHistoryData(data?: Record<string, unknown[]>) {
  if (!data) {
    return {};
  }

  let results = data.safeTxs
    .map(
      (item: any): TransactionSignature => ({
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
    .reduce<HistoryData>((result, value) => {
      const dayStart = dayjs(value.transaction.updatedAt).startOf('days').valueOf();

      if (result[dayStart]) {
        result[dayStart].push({ type: 'safe-tx', data: value });
      } else {
        result[dayStart] = [{ type: 'safe-tx', data: value }];
      }

      return result;
    }, {});

  results = data.moduleTxs
    .map(
      (item: any): ModuleTransactionResponse => ({
        ...item,
        value: BigInt(item.value),
        block: BigInt(item.block)
      })
    )
    .reduce<HistoryData>((result, value) => {
      const dayStart = dayjs(value.createdAt).startOf('days').valueOf();

      if (result[dayStart]) {
        result[dayStart].push({ type: 'safe-module-tx', data: value });
      } else {
        result[dayStart] = [{ type: 'safe-module-tx', data: value }];
      }

      return result;
    }, results);

  results = data.allowanceTxs
    .map(
      (item: any): AllowanceTransactionResponse => ({
        ...item,
        block: BigInt(item.block),
        value: item.value ? BigInt(item.value) : null,
        payment: item.payment ? BigInt(item.payment) : null,
        allowanceAmount: item.allowanceAmount ? BigInt(item.allowanceAmount) : null,
        createdAt: Number(item.createdAt)
      })
    )
    .reduce<HistoryData>((result, value) => {
      const dayStart = dayjs(value.createdAt).startOf('days').valueOf();

      if (result[dayStart]) {
        result[dayStart].push({ type: 'allowance-tx', data: value });
      } else {
        result[dayStart] = [{ type: 'allowance-tx', data: value }];
      }

      return result;
    }, results);

  results = data.receivedTxs
    .map(
      (item: any): ReceivedResponse => ({
        ...item,
        block: BigInt(item.block),
        value: BigInt(item.value)
      })
    )
    .reduce<HistoryData>((result, value) => {
      const dayStart = dayjs(value.createdAt).startOf('days').valueOf();

      if (result[dayStart]) {
        result[dayStart].push({ type: 'received-tx', data: value });
      } else {
        result[dayStart] = [{ type: 'received-tx', data: value }];
      }

      return result;
    }, results);

  return results;
}

export function useHistoryTransactions(
  chainId: number,
  address?: Address
): [HistoryData, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery({
    queryKey: [address ? serviceUrl(chainId, `tx/history/${address}`) : null]
  });

  return useMemo(() => {
    return [extraHistoryData(data as Record<string, unknown[]>), isFetched, isFetching];
  }, [data, isFetched, isFetching]);
}

export function useTransactionSignature(
  chainId: number,
  hash?: Hash | null
): [TransactionSignature | null, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { data, isFetched, isFetching, refetch } = useQuery<any>({
    initialData: null,
    queryKey: [hash ? serviceUrl(chainId, `tx/details/${hash}`) : null],
    enabled: false
  });

  return useMemo(
    () => [
      data
        ? {
            transaction: {
              ...data.transaction,
              value: BigInt(data.transaction.value),
              safeTxGas: BigInt(data.transaction.safeTxGas),
              baseGas: BigInt(data.transaction.baseGas),
              gasPrice: BigInt(data.transaction.gasPrice),
              nonce: BigInt(data.transaction.nonce),
              payment: BigInt(data.transaction.payment),
              executeBlock: data.transaction.executeBlock ? BigInt(data.transaction.executeBlock) : undefined,
              replaceBlock: data.transaction.replaceBlock ? BigInt(data.transaction.replaceBlock) : undefined
            },
            signatures: data.signatures
          }
        : null,
      isFetched,
      isFetching,
      refetch
    ],
    [data, isFetched, isFetching, refetch]
  );
}
