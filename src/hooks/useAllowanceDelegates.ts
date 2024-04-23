// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useEffect, useState } from 'react';
import { zeroAddress } from 'viem';
import { useChainId, usePublicClient, useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';
import { IPublicClient } from '@mimir-wallet/safe/types';

type Allowance = [amount: bigint, spent: bigint, resetTimeMin: bigint, lastResetMin: bigint, nonce: bigint];

async function queryTokenAllowance(client: IPublicClient, safeAddress: Address, delegates: Address[]) {
  const chainId = client.chain.id;

  const tokens = (await client.multicall({
    allowFailure: false,
    contracts: delegates.map((delegate) => ({
      address: deployments[chainId].modules.Allowance,
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
      address: deployments[chainId].modules.Allowance,
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

export function useAllowanceDelegates(safeAddress: Address): Address[] {
  const chainId = useChainId();
  const { data: startAccount } = useReadContract({
    chainId,
    address: deployments[chainId].modules.Allowance,
    abi: abis.Allowance,
    functionName: 'delegatesStart',
    args: [safeAddress]
  });

  const { data: delegates } = useReadContract({
    chainId,
    address: deployments[chainId].modules.Allowance,
    abi: abis.Allowance,
    functionName: 'getDelegates',
    args: startAccount ? [safeAddress, startAccount, 100] : undefined
  });

  return (delegates?.[0] || []) as Address[];
}

export function useAllowanceTokens(safeAddress: Address, delegates: Address[]) {
  const chainId = useChainId();
  const client = usePublicClient({ chainId });
  const [data, setData] = useState<{ delegate: Address; token: Address; allowance: Allowance }[]>([]);

  useEffect(() => {
    if (client && delegates.length > 0) {
      queryTokenAllowance(client, safeAddress, delegates).then(setData);
    }
  }, [client, delegates, safeAddress]);

  return data;
}

export function useDelegateAllowance(
  safeAddress?: Address,
  delegate?: Address,
  token: Address = zeroAddress
): Allowance | undefined {
  const chainId = useChainId();

  const { data: tokenAllowance } = useReadContract({
    chainId,
    address: deployments[chainId].modules.Allowance,
    abi: abis.Allowance,
    functionName: 'getTokenAllowance',
    args: safeAddress && delegate ? [safeAddress, delegate, token] : undefined
  });

  return tokenAllowance as Allowance | undefined;
}
