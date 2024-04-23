// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { PublicClient } from 'viem';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChainId, usePublicClient } from 'wagmi';

import { service } from '@mimir-wallet/utils';

export function useMultisigs(
  address?: Address,
  addMultisig?: (account: AccountResponse, client?: PublicClient) => Promise<void>
) {
  const chainId = useChainId();
  const client = usePublicClient();

  const { data } = useQuery({
    initialData: [],
    queryKey: [chainId, address],
    queryFn: () => (address ? service.getOwnedAccount(chainId, address) : [])
  });

  useEffect(() => {
    data?.forEach((item) => {
      addMultisig?.(item, client);
    });
  }, [addMultisig, client, data]);

  return data;
}
