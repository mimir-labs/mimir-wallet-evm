// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { DelayModule, DelayModuleResponse } from './types';

import { useQuery } from '@tanstack/react-query';
import { useChainId, useReadContracts } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { serviceUrl } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';

const SENTINEL_MODULES: Address = '0x0000000000000000000000000000000000000001' as const;

export function useDelayAddress(
  address?: Address
): [data: DelayModuleResponse[], isFetched: boolean, isFetching: boolean] {
  const chainId = useChainId();
  const { data, isFetched, isFetching } = useQuery<DelayModuleResponse[]>({
    initialData: EmptyArray,
    refetchInterval: false,
    queryKey: [address ? serviceUrl(chainId, `modules/delay/${address}`) : null]
  });

  return [data, isFetched, isFetching];
}

export function useDelayModules(address?: Address): [data: DelayModule[], isFetched: boolean, isFetching: boolean] {
  const chainId = useChainId();
  const { data, isFetched, isFetching } = useQuery<DelayModuleResponse[]>({
    initialData: EmptyArray,
    refetchInterval: false,
    queryKey: [address ? serviceUrl(chainId, `modules/delay/${address}`) : null]
  });

  const {
    data: results,
    isFetched: isFetched2,
    isFetching: isFetching2
  } = useReadContracts({
    allowFailure: false,
    query: { refetchInterval: false },
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

  return [
    data && results
      ? data.map((item, index) => ({
          address: item.address,
          modules: (results[index * 3 + 2] as unknown as [Address[]])[0],
          expiration: results[index * 3] as bigint,
          cooldown: results[index * 3 + 1] as bigint
        }))
      : EmptyArray,
    isFetched ? (data.length === 0 ? true : isFetched2) : false,
    isFetching || isFetching2
  ];
}
