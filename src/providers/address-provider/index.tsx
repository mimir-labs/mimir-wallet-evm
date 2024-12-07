// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SafeAccount } from '@mimir-wallet/safe/types';
import type { State } from './types';

import React, { createContext, useEffect, useMemo, useState } from 'react';

import { ADDRESS_NAMES_KEY } from '@mimir-wallet/constants';
import { useCurrentChain, useLocalStore, useQueryTokens } from '@mimir-wallet/hooks';

import { useAddress } from './useAddress';
import { useAddressBook } from './useAddressBook';
import { useCustomTokens } from './useCustomTokens';
import { useWatchOnly } from './useWatchOnly';

export const AddressContext = createContext<State>({ all: [], addresses: [], signers: [] } as unknown as State);

function AddressProvider({ children }: { children: React.ReactNode }) {
  const [chainId] = useCurrentChain();
  const tokens = useQueryTokens();
  const { isReady, current, isSigner, signers, isReadOnly, multisigs, addMultisig, changeName, switchAddress } =
    useAddress();
  const [addressNames, setAddressNames] = useLocalStore<Record<string, string>>(ADDRESS_NAMES_KEY, {});
  const [addressIcons, setAddressIcons] = useState<Record<number, Record<string, string>>>({});
  const [queryCache, setQueryCache] = useState<Record<Address, SafeAccount>>({});
  const { addresses, node, addAddressBook } = useAddressBook();
  const { watchlist, addWatchOnlyList, node: watchOnlyNode } = useWatchOnly(setAddressNames);
  const { customTokens, addCustomToken } = useCustomTokens();

  useEffect(() => {
    if (tokens.length > 0) {
      setAddressIcons((icons) => ({
        ...icons,
        ...tokens.reduce<Record<string, Record<string, string>>>((results, item) => {
          if (item.icon) {
            if (results[item.chainId]) {
              results[item.chainId][item.address] = item.icon;
            } else {
              results[item.chainId] = { [item.address]: item.icon };
            }
          }

          return results;
        }, {})
      }));
    }
  }, [tokens]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value: State = {
    addresses: useMemo(
      () => addresses.filter((item) => item.chainId === chainId).map((item) => item.address),
      [addresses, chainId]
    ),
    addressNames: useMemo(
      () => ({
        ...tokens.reduce<Record<string, string>>((results, item) => {
          if (item.chainId === chainId) {
            results[item.address] = item.symbol;
          }

          return results;
        }, {}),
        ...addressNames,
        ...addresses
          .filter((item) => item.chainId === chainId)
          .reduce<Record<string, string>>((results, item) => {
            results[item.address] = item.name;
            results[item.address.toLowerCase()] = item.name;

            return results;
          }, {})
      }),
      [addressNames, chainId, tokens, addresses]
    ),
    tokens,
    addressIcons,
    queryCache,
    customTokens,
    watchlist,
    isReady,
    current,
    isSigner,
    signers,
    isReadOnly,
    multisigs,
    addMultisig,
    changeName,
    switchAddress,
    addAddressBook,
    addCustomToken,
    setQueryCache,
    addWatchOnlyList
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
      {node}
      {watchOnlyNode}
    </AddressContext.Provider>
  );
}

export default AddressProvider;
