// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { DelayModuleResponse } from './types';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useChainId, useReadContracts } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { serviceUrl } from '@mimir-wallet/config';

const SENTINEL_MODULES: Address = '0x0000000000000000000000000000000000000001' as const;

type Data = {
  address: Address;
  modules: Address[];
  expiration: bigint;
  cooldown: bigint;
};

export function useDelayModules(address?: Address): [Data[], boolean] {
  const chainId = useChainId();
  const { data } = useQuery<DelayModuleResponse[]>({
    initialData: [],
    refetchInterval: false,
    queryKey: [address ? serviceUrl(chainId, `modules/delay/${address}`) : null]
  });

  const { data: results, isFetching } = useReadContracts({
    allowFailure: false,
    contracts: data
      .map((item) => [
        {
          abi: abis.Delay,
          address: item.address,
          functionName: 'txExpiration'
        },
        {
          abi: abis.Delay,
          address: item.address,
          functionName: 'txCooldown'
        },
        {
          abi: abis.Delay,
          address: item.address,
          functionName: 'getModulesPaginated',
          args: [SENTINEL_MODULES, 100n]
        }
      ])
      .flat()
  });

  return useMemo(() => {
    if (!results || !data) return [[], true];

    const items: Data[] = [];

    for (let i = 0; i < results.length / 3; i++) {
      items.push({
        address: data[i].address,
        modules: (results[i * 3 + 2] as unknown as [Address[]])[0],
        expiration: results[i * 3] as bigint,
        cooldown: results[i * 3 + 1] as bigint
      });
    }

    return [items, isFetching];
  }, [data, isFetching, results]);
}
