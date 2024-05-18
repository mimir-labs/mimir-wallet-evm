// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useMemo } from 'react';
import { useChainId } from 'wagmi';

import { AddressContext } from '@mimir-wallet/providers';
import { service } from '@mimir-wallet/utils';

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

export function useQueryAccount(address?: Address): BaseAccount | null {
  const chainId = useChainId();
  const { setAddressNames, isMultisig } = useContext(AddressContext);

  const { data } = useQuery({
    initialData: null,
    queryKey: [chainId, address],
    queryFn: () => (address ? service.getAccountFull(chainId, address) : null)
  });

  useEffect(() => {
    if (data) {
      const names = findNames(data);

      setAddressNames((values) => ({ ...values, ...names }));
    }
  }, [setAddressNames, data]);

  return useMemo(
    () =>
      data
        ? {
            ...data,
            isReadOnly: !isMultisig(data.address)
          }
        : null,
    [data, isMultisig]
  );
}
