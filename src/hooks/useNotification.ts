// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueries } from '@tanstack/react-query';

import { notificationServiceUrl } from '@mimir-wallet/config';

export function useNotifications(uuid: string) {
  const result = useQueries({
    queries: [
      {
        refetchInterval: 0,
        queryHash: notificationServiceUrl(`subscribe/firebase/${uuid}`),
        queryKey: [notificationServiceUrl(`subscribe/firebase/${uuid}`)]
      },
      {
        refetchInterval: 0,
        queryHash: notificationServiceUrl(`subscribe/email/${uuid}`),
        queryKey: [notificationServiceUrl(`subscribe/email/${uuid}`)]
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
