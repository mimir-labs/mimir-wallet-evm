// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useQueries } from '@tanstack/react-query';

import { notificationServiceUrl } from '@mimir-wallet/config';

export function useNotifications(address?: Address | null) {
  const result = useQueries({
    queries: [
      {
        refetchInterval: 0,
        queryHash: notificationServiceUrl(`subscribe/firebase/${address}`),
        queryKey: [address ? notificationServiceUrl(`subscribe/firebase/${address}`) : null]
      },
      {
        refetchInterval: 0,
        queryHash: notificationServiceUrl(`subscribe/email/${address}`),
        queryKey: [address ? notificationServiceUrl(`subscribe/email/${address}`) : null]
      }
    ]
  });

  return [
    result[0].data as { topic: `${number}.0x${string}` }[] | undefined,
    result[1].data as
      | { topic: `${number}.0x${string}`; email: string; created: boolean; executed: boolean; approved: boolean }[]
      | undefined,
    result[0].isFetched && result[1].isFetched,
    result[0].isFetching || result[1].isFetching
  ] as const;
}
