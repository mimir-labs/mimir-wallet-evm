// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useCallback, useRef } from 'react';
import { useToggle } from 'react-use';
import { getAddress, isAddress } from 'viem';

import { AddAddressModal } from '@mimir-wallet/components';
import { ADDRESS_BOOK_KEY } from '@mimir-wallet/constants';
import { useCurrentChain, useInput, useInputAddress, useLocalStore } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

export function useAddressBook() {
  const [currentChainId] = useCurrentChain();
  const [addresses, setAddresses] = useLocalStore<
    {
      address: Address;
      chainId: number;
      name: string;
    }[]
  >(ADDRESS_BOOK_KEY, []);

  const [[address], setAddress] = useInputAddress();
  const [name, setName] = useInput('');
  const [isOpen, toggleOpen] = useToggle(false);
  const promiseRef = useRef<{ resolve: (value: [Address, string]) => void; reject: (err: unknown) => void }>();

  const addAddressBook = useCallback(
    (value?: [Address, string]) => {
      if (value) {
        setAddress(getAddress(value[0]));
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
            if (value.some((item) => item.chainId === currentChainId && addressEq(item.address, address))) {
              return value.map((item) =>
                item.chainId === currentChainId && addressEq(item.address, address) ? { ...item, name } : item
              );
            }

            return [...value, { address: getAddress(address), chainId: currentChainId, name }];
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

  return {
    addresses,
    addAddressBook,
    setAddress,
    node
  };
}
