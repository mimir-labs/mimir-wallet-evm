// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useCallback, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { getAddress, isAddress } from 'viem';
import { useChainId } from 'wagmi';

import { AddWatchOnly } from '@mimir-wallet/components';
import { EmptyArray, WATCH_ONLY_KEY } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks';

export function useWatchOnly(
  setAddressNames: (value: Record<string, string> | ((value: Record<string, string>) => Record<string, string>)) => void
) {
  const chainId = useChainId();
  const [address, setAddress] = useState<Address>();
  const [values, setValues] = useLocalStore<Record<number, Address[]>>(WATCH_ONLY_KEY, {});
  const [isOpen, toggleOpen] = useToggle(false);
  const promiseRef = useRef<{ resolve: (value: Address) => void; reject: (err: unknown) => void }>();

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
    watchOnlyList: values[chainId] || EmptyArray,
    addWatchOnlyList,
    node
  };
}
