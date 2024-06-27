// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useMemo } from 'react';
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

function findThresholds(account: BaseAccount): Record<string, [number, number]> {
  let thresholds: Record<string, [number, number]> =
    account.type === 'safe' && account.members && account.threshold
      ? {
          [account.address]: [account.threshold, account.members.length]
        }
      : {};

  for (const _account of account.members || []) {
    thresholds = {
      ...thresholds,
      ...findThresholds(_account)
    };
  }

  return thresholds;
}

export function useQueryAccount(address?: Address): BaseAccount | null {
  const chainId = useChainId();
  const { setAddressNames, setAddressThresholds, isMultisig } = useContext(AddressContext);

  const { data } = useQuery<BaseAccount | null>({
    initialData: null,
    queryHash: serviceUrl(chainId, `accounts/${address}/full`),
    queryKey: [address ? serviceUrl(chainId, `accounts/${address}/full`) : null]
  });

  useEffect(() => {
    if (data) {
      // const names = findNames(data);
      // setAddressNames((values) => ({ ...values, ...names }));
    }
  }, [setAddressNames, data]);

  useEffect(() => {
    if (data) {
      const thresholds = findThresholds(data);

      setAddressThresholds((values) => ({ ...values, ...thresholds }));
    }
  }, [setAddressThresholds, data]);

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

export function useIsReadOnly(account?: BaseAccount | null) {
  const { isMultisig } = useContext(AddressContext);

  return useMemo(() => (account ? !isMultisig(account.address) : true), [account, isMultisig]);
}
