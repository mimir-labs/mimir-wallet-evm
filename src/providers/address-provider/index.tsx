// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { State } from './types';

import React, { createContext, useEffect, useMemo, useState } from 'react';

import { useQueryTokens } from '@mimir-wallet/hooks';

import { useAddress } from './useAddress';
import { useAddressBook } from './useAddressBook';
import { useCustomTokens } from './useCustomTokens';

export const AddressContext = createContext<State>({ all: [], addresses: [], signers: [] } as unknown as State);

function AddressProvider({ children, defaultCurrent }: React.PropsWithChildren<{ defaultCurrent?: Address }>) {
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
  const { addresses, addressNames, node, addAddressBook, setAddressNames } = useAddressBook(tokens, multisigs);
  const { customTokens, addCustomToken } = useCustomTokens();
  const [addressIcons, setAddressIcons] = useState<Record<number, Record<string, string>>>({});
  const [addressThresholds, setAddressThresholds] = useState<Record<string, [number, number]>>({});

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
        results[item.address] = [item.threshold, item.members.length];

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
    addressNames,
    addressIcons,
    addressThresholds,
    customTokens,
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
    setAddressNames,
    setAddressThresholds
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
      {node}
    </AddressContext.Provider>
  );
}

export default AddressProvider;
