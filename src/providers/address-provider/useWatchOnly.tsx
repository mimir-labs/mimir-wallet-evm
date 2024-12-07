// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { getAddress, isAddress } from 'viem';

import { AddWatchOnly } from '@mimir-wallet/components';
import { accountServices } from '@mimir-wallet/config';
import { EmptyArray, WATCH_ONLY_KEY } from '@mimir-wallet/constants';
import { useCurrentChain, useLocalStore } from '@mimir-wallet/hooks';

import { transformMultisig } from './utils';

export function useWatchOnly(
  setAddressNames: (value: Record<string, string> | ((value: Record<string, string>) => Record<string, string>)) => void
) {
  const [chainId] = useCurrentChain();
  const [address, setAddress] = useState<Address>();
  const [values, setValues] = useLocalStore<Record<number, Address[]>>(WATCH_ONLY_KEY, {});
  const [isOpen, toggleOpen] = useToggle(false);
  const promiseRef = useRef<{ resolve: (value: Address) => void; reject: (err: unknown) => void }>();
  const addressesQuery = Object.entries(values)
    .flatMap(([, multisigs]) => multisigs)
    .join(',');

  const { data } = useQuery<Record<Address, AccountResponse[]>>({
    queryHash: `${accountServices}accounts?addresses=${addressesQuery}`,
    queryKey: [addressesQuery ? `${accountServices}accounts?addresses=${addressesQuery}` : null]
  });

  const watchlist = useMemo(() => transformMultisig(data || {}), [data]);

  const addWatchOnlyList = useCallback(
    (address?: Address) => {
      if (address && isAddress(address)) {
        setAddress(address);
      }

      toggleOpen(true);
    },
    [toggleOpen]
  );

  const node = (
    <AddWatchOnly
      isOpen={isOpen}
      onClose={() => {
        toggleOpen(false);
        setAddress(undefined);
        promiseRef.current?.reject(new Error('Closed'));
      }}
      onConfirm={(address, names) => {
        setAddressNames((value) => {
          const newVal = { ...value, ...names };

          return newVal;
        });
        setValues((values) => ({
          ...values,
          [chainId]: Array.from(new Set([...(values[chainId] || []), getAddress(address)]))
        }));
        setAddress(undefined);
        promiseRef.current?.resolve(address);
      }}
      safeAddress={address}
    />
  );

  return {
    watchlist,
    watchOnlyList: values[chainId] || EmptyArray,
    addWatchOnlyList,
    node
  };
}
