// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { State } from './types';

import React, { createContext, useMemo } from 'react';

import { useAddress } from './useAddress';
import { useAddressBook } from './useAddressBook';

export const AddressContext = createContext<State>({ all: [], addresses: [], signers: [] } as unknown as State);

function AddressProvider({ children }: React.PropsWithChildren) {
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
  } = useAddress();
  const { addresses, addressNames, node, addAddressBook } = useAddressBook();

  const mergedAddressNames = useMemo(
    () => ({
      ...addressNames,
      ...multisigs.reduce<Record<string, string>>((value, item) => {
        value[item.address] = item.name || '';

        return value;
      }, {})
    }),
    [addressNames, multisigs]
  );

  const all = useMemo(
    () => addresses.concat(signers || []).concat(multisigs.map((item) => item.address)),
    [addresses, multisigs, signers]
  );

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value: State = {
    addresses,
    addressNames: mergedAddressNames,
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
    addAddressBook
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
      {node}
    </AddressContext.Provider>
  );
}

export default AddressProvider;
