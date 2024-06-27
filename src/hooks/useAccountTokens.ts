// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomToken } from '@mimir-wallet/providers/address-provider/types';
import type { AccountBalances } from './types';

import { useQuery } from '@tanstack/react-query';
import { Address } from 'abitype';
import { useContext, useMemo } from 'react';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
import { useBalance, useChainId, useReadContract, useReadContracts } from 'wagmi';

import { assetsSrviceUrl } from '@mimir-wallet/config';
import { EmptyArray } from '@mimir-wallet/constants';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

import { useToken } from './useToken';

function _combineResults(data: AccountBalances, customTokens: CustomToken[], balances?: bigint[]): AccountBalances {
  return {
    ...data,
    assets: data.assets.concat(
      customTokens.map((item, index) => ({
        tokenAddress: item.address,
        name: item.name,
        symbol: item.symbol,
        decimals: item.decimals,
        price: '0',
        balance: formatUnits(balances?.[index] || 0n, item.decimals),
        balanceWei: balances?.[index]?.toString() || '0',
        balanceUsd: '0'
      }))
    )
  };
}

export function useAccountTokens(address?: Address) {
  const chainId = useChainId();
  const { data, isFetched, isFetching } = useQuery<AccountBalances>({
    initialData: {
      assets: EmptyArray,
      totalBalanceUsd: '0',
      totalCount: 0
    },
    queryHash: assetsSrviceUrl(`addresses/${address}/tokens?chain_id=${chainId}`),
    queryKey: [address ? assetsSrviceUrl(`addresses/${address}/tokens?chain_id=${chainId}`) : null]
  });
  const { customTokens } = useContext(AddressContext);
  const chainTokens = useMemo(
    () =>
      customTokens.filter(
        (item) =>
          item.chainId === chainId &&
          data.assets.findIndex(({ tokenAddress }) => addressEq(tokenAddress, item.address)) === -1
      ),
    [chainId, customTokens, data.assets]
  );

  const {
    data: customBalances,
    isFetched: isFetched2,
    isFetching: isFetching2
  } = useReadContracts({
    allowFailure: false,
    contracts: address
      ? chainTokens.map((item) => ({
          address: item.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address]
        }))
      : []
  });

  return [
    useMemo(
      () => _combineResults(data, customTokens, customBalances as bigint[]),
      [customBalances, customTokens, data]
    ),
    isFetched ? (chainTokens.length === 0 ? true : isFetched2) : false,
    isFetching || isFetching2
  ] as const;
}

export function useAccountBalance(
  address?: Address,
  token?: Address
): [
  { value: bigint; symbol: string; decimals: number; name: string } | undefined,
  isFetched: boolean,
  isFetching: boolean
] {
  const [meta, isFetched, isFetching] = useToken(token);
  const {
    data,
    isFetched: isFetched2,
    isFetching: isFetching2
  } = useReadContract(
    address
      ? {
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
          query: { retry: 1 }
        }
      : {}
  );
  const {
    data: nativeBalance,
    isFetched: isFetched3,
    isFetching: isFetching3
  } = useBalance({ address: token === zeroAddress ? address : undefined });

  return useMemo(
    () => [
      meta ? { ...meta, value: (token === zeroAddress ? nativeBalance?.value : data) || 0n } : undefined,
      isFetched && (token === zeroAddress ? isFetched3 : isFetched2),
      isFetching || (token === zeroAddress ? isFetching3 : isFetching2)
    ],
    [data, isFetched, isFetched2, isFetched3, isFetching, isFetching2, isFetching3, meta, nativeBalance, token]
  );
}
