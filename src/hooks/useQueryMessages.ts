// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { MessageResponse, SignatureResponse } from './types';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Hash } from 'viem';

import { serviceUrl } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';

export type MessageSignature = {
  message: MessageResponse;
  signatures: SignatureResponse[];
};

export function useQueryMessages(
  chainId: number,
  address?: Address
): [MessageSignature[], isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { data, isFetched, isFetching, refetch } = useQuery<MessageSignature[]>({
    initialData: EmptyArray,
    queryKey: [address ? serviceUrl(chainId, `messages/${address}`) : null]
  });

  return useMemo(() => [data, isFetched, isFetching, refetch], [data, isFetched, isFetching, refetch]);
}

export function useQueryMessage(
  chainId: number,
  hash?: Hash
): [MessageSignature | null, isFetched: boolean, isFetching: boolean, refetch: () => void] {
  const { data, isFetched, isFetching, refetch } = useQuery<{ result: MessageSignature | null }>({
    initialData: { result: null },
    queryKey: [hash ? serviceUrl(chainId, `message/${hash}`) : null]
  });

  return useMemo(() => [data.result, isFetched, isFetching, refetch], [data, isFetched, isFetching, refetch]);
}
