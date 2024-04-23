// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Token } from './types';

import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';

import { IPublicClient } from '@mimir-wallet/safe/types';

async function queryToken(client: IPublicClient, tokens: Address[]): Promise<Record<Address, Token>> {
  const data = await client.multicall({
    allowFailure: true,
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

  const results: Record<Address, Token> = {};

  for (let i = 0; i < tokens.length; i++) {
    const [name, symbol, decimals] = data.slice(i * 3, i * 3 + 3);

    if (name.status === 'success' && symbol.status === 'success' && decimals.status === 'success') {
      results[tokens[i]] = {
        name: name.result.toString() || '',
        symbol: symbol.result.toString() || '',
        decimals: Number(decimals.result) || 18
      };
    }
  }

  return results;
}

export function useTokens(tokens: Address[]): Record<Address, Token> {
  const chainId = useChainId();
  const client = usePublicClient({ chainId });
  const [data, setData] = useState<Record<Address, Token>>({});

  useEffect(() => {
    if (client && tokens.length > 0) {
      queryToken(client, tokens).then(setData);
    }
  }, [client, tokens]);

  return data;
}
