// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { State } from './types';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { getAddress } from 'viem';
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
    addMultisig,
    changeName,
    isCurrent,
    switchAddress
  } = useAddress(defaultCurrent);
  const [addressNames, setAddressNames] = useLocalStore<Record<string, string>>(ADDRESS_NAMES_KEY, {});
  const [addressIcons, setAddressIcons] = useState<Record<number, Record<string, string>>>({});
  const [addressThresholds, setAddressThresholds] = useState<Record<string, [number, number]>>({});
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

  useEffect(() => {
    setAddressThresholds((thresholds) => ({
      ...thresholds,
      ...multisigs.reduce<Record<string, [number, number]>>((results, item) => {
        results[getAddress(item.address)] = [item.threshold, item.members.length];

        return results;
      }, {})
    }));
  }, [multisigs]);

  const all = useMemo(
    () => Array.from(new Set((addresses || []).concat(signers || []).concat(multisigs.map((item) => item.address)))),
    [addresses, multisigs, signers]
  );

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value: State = {
    addresses,
    addressNames: useMemo(
      () => ({
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
      [addressNames, chainId, multisigs, tokens]
    ),
    addressIcons,
    addressThresholds,
    customTokens,
    watchOnlyList,
    all,
    isReady,
    current,
    isSigner,
    signers,
    isMultisig,
    multisigs,
    addMultisig,
    changeName,
    isCurrent,
    switchAddress,
    addAddressBook,
    addCustomToken,
    setAddressThresholds,
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
