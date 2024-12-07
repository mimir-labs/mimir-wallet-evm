// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Allowance, TokenAllowance } from './types';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { moduleDeployments } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';
import { useCurrentChain } from '@mimir-wallet/hooks';
import { IPublicClient } from '@mimir-wallet/safe/types';

import { useAllowanceDelegates } from './useDelegates';

async function queryTokenAllowance(
  client: IPublicClient,
  safeAddress: Address,
  delegates: Address[]
): Promise<TokenAllowance[]> {
  const chainId = client.chain.id;

  const tokens = (await client.multicall({
    allowFailure: false,
    contracts: delegates.map((delegate) => ({
      address: moduleDeployments[chainId].Allowance[0],
      abi: abis.Allowance,
      functionName: 'getTokens',
      args: [safeAddress, delegate]
    }))
  })) as unknown as Address[][];

  const query: [delegate: Address, token: Address][] = [];

  for (let i = 0; i < delegates.length; i++) {
    for (let j = 0; j < tokens[i].length; j++) {
      query.push([delegates[i], tokens[i][j]]);
    }
  }

  const data = (await client.multicall({
    allowFailure: false,
    contracts: query.map(([delegate, token]) => ({
      address: moduleDeployments[chainId].Allowance[0],
      abi: abis.Allowance,
      functionName: 'getTokenAllowance',
      args: [safeAddress, delegate, token]
    }))
  })) as unknown as Allowance[];

  return query.map(([delegate, token], i) => ({
    delegate,
    token,
    allowance: data[i]
  }));
}

export function useAllowanceTokens(
  safeAddress: Address
): [data: TokenAllowance[], isFetched: boolean, isFetching: boolean] {
  const [delegates, _isFetched, _isFetching] = useAllowanceDelegates(safeAddress);
  const [chainId] = useCurrentChain();
  const client = usePublicClient({ chainId });
  const { data, isFetched, isFetching } = useQuery({
    initialData: EmptyArray,
    queryKey: [safeAddress, delegates, 'queryTokenAllowance'] as const,
    queryFn: ({ queryKey }) => (client ? queryTokenAllowance(client, queryKey[0], queryKey[1]) : EmptyArray)
  });

  return [data, _isFetched && isFetched, _isFetching || isFetching];
}
