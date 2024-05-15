// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import store from 'store';
import { isAddress } from 'viem';
import { useChainId } from 'wagmi';

import { AddAddressModal } from '@mimir-wallet/components';
import { ADDRESS_BOOK_KEY, ADDRESS_NAMES_KEY } from '@mimir-wallet/constants';
import { useInput, useInputAddress } from '@mimir-wallet/hooks';

export function useAddressBook(
  tokens: { name: string; symbol: string; chainId: number; address: Address; icon?: string | null }[],
  multisigs: Multisig[]
) {
  const chainId = useChainId();
  const [addresses, setAddresses] = useState<Address[]>(store.get(ADDRESS_BOOK_KEY) || []);
  const [addressNames, setAddressNames] = useState<Record<string, string>>(store.get(ADDRESS_NAMES_KEY) || {});

  const [[address], setAddress] = useInputAddress();
  const [name, setName] = useInput('');
  const [isOpen, toggleOpen] = useToggle(false);
  const promiseRef = useRef<{ resolve: (value: [Address, string]) => void; reject: (err: unknown) => void }>();

  useEffect(() => {
    setAddressNames((names) => ({
      ...names,
      ...tokens.reduce<Record<string, string>>((results, item) => {
        if (item.chainId === chainId) {
          results[item.address] = item.symbol;
        }

        return results;
      }, {}),
      ...multisigs.reduce<Record<string, string>>((value, item) => {
        value[item.address] = item.name || '';

        return value;
      }, {})
    }));
  }, [chainId, multisigs, tokens]);

  const addAddressBook = useCallback(
    (value?: [Address, string]) => {
      if (value) {
        setAddress(value[0]);
        setName(value[1]);
      } else {
        setAddress('');
        setName('');
      }

      toggleOpen(true);

      return new Promise<[address: Address, name: string]>((resolve, reject) => {
        promiseRef.current = { resolve, reject };
      });
    },
    [setAddress, setName, toggleOpen]
  );

  const node = (
    <AddAddressModal
      isOpen={isOpen}
      onClose={() => {
        promiseRef.current?.reject(new Error('Closed'));
        toggleOpen(false);
      }}
      onConfirm={() => {
        if (isAddress(address) && name) {
          setAddresses((value) => {
            const newVal = Array.from(new Set([...value, address]));

            setTimeout(() => store.set(ADDRESS_BOOK_KEY, newVal));

            return newVal;
          });
          setAddressNames((value) => {
            const newVal = { ...value, [address]: name };

            setTimeout(() => store.set(ADDRESS_NAMES_KEY, newVal));

            return newVal;
          });
          promiseRef.current?.resolve([address, name]);
          toggleOpen(false);
        }
      }}
      name={name}
      address={address}
      setName={setName}
      setAddress={setAddress}
    />
  );

  return { addresses, addressNames, addAddressBook, setAddress, setName, setAddressNames, node };
}
