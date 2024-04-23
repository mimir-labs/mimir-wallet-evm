// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

import { service } from '@mimir-wallet/utils';

export function useQueryAccount(address?: Address): BaseAccount | null {
  const chainId = useChainId();

  const { data } = useQuery({
    initialData: null,
    queryKey: [chainId, address],
    queryFn: () => (address ? service.getAccountFull(chainId, address) : null)
  });

  return data;
}
