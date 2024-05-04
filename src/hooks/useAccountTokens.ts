// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CustomToken } from '@mimir-wallet/providers/address-provider/types';
import type { AccountBalances } from './types';

import { useQuery } from '@tanstack/react-query';
import { Address } from 'abitype';
import { useContext, useMemo } from 'react';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
import { useBalance, useChainId, useReadContracts } from 'wagmi';

import { assetsSrviceUrl } from '@mimir-wallet/config';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

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
    refetchInterval: 14_000,
    initialData: {
      assets: [],
      totalBalanceUsd: '0',
      totalCount: 0
    },
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

  const { data: customBalances } = useReadContracts({
    allowFailure: false,
    query: { refetchInterval: 14_000 },
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
    isFetched,
    isFetching
  ] as const;
}

export function useAccountBalance(
  address?: Address,
  token?: Address
): { value: bigint; symbol: string; decimals: number; name: string } | undefined {
  const { data: nativeBalance } = useBalance(token && token === zeroAddress ? { address } : {});
  const { data: ercBalance } = useReadContracts(
    address && token && token !== zeroAddress
      ? {
          allowFailure: false,
          contracts: [
            {
              address: token,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address]
            },
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
          ]
        }
      : {}
  );

  return useMemo(() => {
    if (!token) return undefined;

    if (token === zeroAddress) {
      return nativeBalance ? { ...nativeBalance, name: nativeBalance.symbol } : undefined;
    }

    if (ercBalance) {
      return {
        value: ercBalance[0],
        name: ercBalance[1],
        symbol: ercBalance[2],
        decimals: ercBalance[3]
      };
    }

    return undefined;
  }, [ercBalance, nativeBalance, token]);
}
