// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { TokenMeta } from './types';

import { useEffect, useMemo, useState } from 'react';
import { Chain, erc20Abi, zeroAddress } from 'viem';
import { useChainId, useClient, useReadContracts } from 'wagmi';

async function extraTokens(
  data: (
    | {
        error: Error;
        result?: undefined;
        status: 'failure';
      }
    | {
        error?: undefined;
        result: string | number | bigint;
        status: 'success';
      }
  )[],
  chain: Chain,
  tokens: Address[]
): Promise<Record<Address, TokenMeta>> {
  const results: Record<Address, TokenMeta> = {};

  for (let i = 0; i < tokens.length; i++) {
    const [name, symbol, decimals] = data.slice(i * 3, i * 3 + 3);

    if (tokens[i] === zeroAddress) {
      results[tokens[i]] = {
        chainId: chain.id,
        address: tokens[i],
        name: chain.nativeCurrency.name || 'Ether',
        symbol: chain.nativeCurrency.symbol || 'ETH',
        decimals: chain.nativeCurrency.decimals || 18
      };
    } else if (name.status === 'success' && symbol.status === 'success' && decimals.status === 'success') {
      results[tokens[i]] = {
        chainId: chain.id,
        address: tokens[i],
        name: name.result.toString() || '',
        symbol: symbol.result.toString() || '',
        decimals: Number(decimals.result) || 18
      };
    }
  }

  return results;
}

export function useTokens(tokens: Address[]): Record<Address, TokenMeta> {
  const chainId = useChainId();
  const client = useClient({ chainId });
  const { data: results } = useReadContracts({
    allowFailure: true,
    query: {
      initialData: []
    },
    contracts: tokens
      .map((token) => [
        {
          address: token,
          abi: erc20Abi,
          functionName: 'name'
        },
        {
          address: token,
          abi: erc20Abi,
          functionName: 'symbol'
        },
        {
          address: token,
          abi: erc20Abi,
          functionName: 'decimals'
        }
      ])
      .flat()
  });
  const [data, setData] = useState<Record<Address, TokenMeta>>({});

  useEffect(() => {
    if (client && tokens.length > 0 && results && results.length > 0) {
      extraTokens(results, client.chain, tokens).then(setData);
    }
  }, [client, results, tokens]);

  return data;
}

export function useToken(tokenAddr?: Address): [meta: TokenMeta | undefined, isFetched: boolean, isFetching: boolean] {
  const chainId = useChainId();
  const client = useClient({ chainId });
  const { data, isFetched, isFetching } = useReadContracts({
    allowFailure: false,
    contracts:
      tokenAddr !== zeroAddress
        ? [
            {
              chainId,
              address: tokenAddr,
              abi: erc20Abi,
              functionName: 'name'
            },
            {
              chainId,
              address: tokenAddr,
              abi: erc20Abi,
              functionName: 'symbol'
            },
            {
              chainId,
              address: tokenAddr,
              abi: erc20Abi,
              functionName: 'decimals'
            }
          ]
        : undefined
  });

  return useMemo(
    () =>
      tokenAddr === zeroAddress
        ? [
            {
              chainId,
              address: tokenAddr,
              name: client?.chain.nativeCurrency.name || 'Ether',
              symbol: client?.chain.nativeCurrency.symbol || 'ETH',
              decimals: client?.chain.nativeCurrency.decimals || 18
            },
            true,
            false
          ]
        : tokenAddr
          ? [
              data
                ? {
                    chainId,
                    address: tokenAddr,
                    name: data[0],
                    symbol: data[1],
                    decimals: data[2]
                  }
                : undefined,
              isFetched,
              isFetching
            ]
          : [undefined, false, false],
    [
      chainId,
      client?.chain.nativeCurrency.decimals,
      client?.chain.nativeCurrency.name,
      client?.chain.nativeCurrency.symbol,
      data,
      isFetched,
      isFetching,
      tokenAddr
    ]
  );
}
