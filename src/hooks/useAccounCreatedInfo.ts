// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { decodeFunctionData, encodeFunctionData, getAddress, type Hex } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { serviceUrl } from '@mimir-wallet/config';

export function useAccountCreatedInfo(chainId: number, safeAddress: Address) {
  const { data, error, isFetched, isFetching } = useQuery<{ to: Address | null; input: Hex } | null>({
    initialData: null,
    queryHash: serviceUrl(chainId, `accounts/created-info/${safeAddress}`),
    queryKey: [serviceUrl(chainId, `accounts/created-info/${safeAddress}`)]
  });

  const [replayParams, reason] = useMemo(() => {
    if (data && data.to && data.input) {
      try {
        const result = decodeFunctionData({
          abi: abis.SafeProxyFactory,
          data: data.input
        });

        if (result.functionName === 'createProxyWithNonce') {
          return [
            {
              factory: getAddress(data.to),
              functionName: 'createProxyWithNonce',
              singleton: result.args[0],
              initializer: result.args[1],
              salt: result.args[2],
              data: encodeFunctionData({
                abi: abis.SafeProxyFactory,
                functionName: 'createProxyWithNonce',
                args: result.args
              })
            },
            null
          ];
        }

        if (result.functionName === 'createProxyWithCallback') {
          return [
            {
              factory: getAddress(data.to),
              functionName: 'createProxyWithCallback',
              singleton: result.args[0],
              initializer: result.args[1],
              salt: result.args[2],
              callback: result.args[3],
              data: encodeFunctionData({
                abi: abis.SafeProxyFactory,
                functionName: 'createProxyWithCallback',
                args: result.args
              })
            },
            null
          ];
        }
      } catch {
        /* empty */
      }
    }

    if (error) {
      return [null, error.message];
    }

    return [null, 'This Safe cannot be replayed on any chains.'];
  }, [data, error]);

  return [replayParams, reason, isFetched, isFetching] as const;
}
