// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount, SafeAccount } from '@mimir-wallet/safe/types';

import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useMemo } from 'react';
import { getAddress } from 'viem';
import { useChainId } from 'wagmi';

import { serviceUrl } from '@mimir-wallet/config';
import { AddressContext } from '@mimir-wallet/providers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findNames(account: BaseAccount): Record<string, string> {
  let names: Record<string, string> = account.name
    ? {
        [account.address]: account.name
      }
    : {};

  for (const _account of account.members || []) {
    names = {
      ...names,
      ...findNames(_account)
    };
  }

  return names;
}

function findBaseAccount(account: BaseAccount): Record<Address, SafeAccount> {
  let cache: Record<Address, SafeAccount> =
    account.type === 'safe' && account.members && account.threshold
      ? {
          [getAddress(account.address)]: account as SafeAccount
        }
      : {};

  for (const _account of account.members || []) {
    cache = {
      ...cache,
      ...findBaseAccount(_account)
    };
  }

  return cache;
}

export function useQueryAccount(address?: Address, refetch = true, retry: boolean | number = true): BaseAccount | null {
  const [account] = useQueryAccountWithState(address, refetch, retry);

  return account;
}

export function useQueryAccountWithState(
  address?: Address,
  refetch = true,
  retry: boolean | number = true
): [BaseAccount | null, isFetched: boolean, isFetching: boolean] {
  const chainId = useChainId();
  const { setQueryCache } = useContext(AddressContext);

  const { data, isFetched, isFetching } = useQuery<BaseAccount | null>({
    initialData: null,
    queryHash: serviceUrl(chainId, `accounts/${address}/full`),
    queryKey: [address ? serviceUrl(chainId, `accounts/${address}/full`) : null],
    ...(refetch ? {} : { refetchInterval: false }),
    ...(retry ? { retry } : { retry: false })
  });

  useEffect(() => {
    if (data) {
      const accounts = findBaseAccount(data);

      setQueryCache((values) => ({ ...values, ...accounts }));
    }
  }, [setQueryCache, data]);

  return useMemo(() => [data || null, isFetched, isFetching], [data, isFetched, isFetching]);
}

export function useIsReadOnly(account?: BaseAccount | null) {
  const { isMultisig } = useContext(AddressContext);

  return useMemo(() => (account ? !isMultisig(account.address) : true), [account, isMultisig]);
}
