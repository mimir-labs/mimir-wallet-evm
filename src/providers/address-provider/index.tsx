// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SafeAccount } from '@mimir-wallet/safe/types';
import type { State } from './types';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useChainId } from 'wagmi';

import { ADDRESS_NAMES_KEY } from '@mimir-wallet/constants';
import { useLocalStore, useQueryTokens } from '@mimir-wallet/hooks';

import { Query } from './Query';
import { useAddress } from './useAddress';
import { useAddressBook } from './useAddressBook';
import { useCustomTokens } from './useCustomTokens';
import { useWatchOnly } from './useWatchOnly';

export const AddressContext = createContext<State>({ all: [], addresses: [], signers: [] } as unknown as State);

function AddressProvider({ children, defaultCurrent }: React.PropsWithChildren<{ defaultCurrent?: Address }>) {
  const chainId = useChainId();
  const tokens = useQueryTokens();
  const {
    isReady,
    current,
    isSigner,
    signers,
    isMultisig,
    multisigs,
    otherChainMultisigs,
    addMultisig,
    changeName,
    isCurrent,
    switchAddress
  } = useAddress(defaultCurrent);
  const [addressNames, setAddressNames] = useLocalStore<Record<string, string>>(ADDRESS_NAMES_KEY, {});
  const [addressIcons, setAddressIcons] = useState<Record<number, Record<string, string>>>({});
  const [queryCache, setQueryCache] = useState<Record<Address, SafeAccount>>({});
  const { addresses, node, addAddressBook } = useAddressBook(setAddressNames);
  const { watchOnlyList, addWatchOnlyList, node: watchOnlyNode } = useWatchOnly(setAddressNames);
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

  const all = useMemo(
    () => Array.from(new Set((addresses || []).concat(signers || []).concat(multisigs.map((item) => item.address)))),
    [addresses, multisigs, signers]
  );

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value: State = {
    addresses,
    addressNames: useMemo(
      () => ({
        ...otherChainMultisigs.reduce<Record<string, string>>((value, item) => {
          value[item.address] = item.name || '';

          return value;
        }, {}),
        ...tokens.reduce<Record<string, string>>((results, item) => {
          if (item.chainId === chainId) {
            results[item.address] = item.symbol;
          }

          return results;
        }, {}),
        ...addressNames,
        ...multisigs.reduce<Record<string, string>>((value, item) => {
          value[item.address] = item.name || '';

          return value;
        }, {})
      }),
      [addressNames, chainId, multisigs, otherChainMultisigs, tokens]
    ),
    addressIcons,
    queryCache,
    customTokens,
    watchOnlyList,
    all,
    isReady,
    current,
    isSigner,
    signers,
    isMultisig,
    multisigs,
    otherChainMultisigs,
    addMultisig,
    changeName,
    isCurrent,
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
      {watchOnlyList.map((address) => (
        <Query key={address} address={address} />
      ))}
    </AddressContext.Provider>
  );
}

export default AddressProvider;
