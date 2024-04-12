// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';

import { createContext, useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

interface State {
  all: Address[];
  addresses: Address[];
  signers: Address[];
  isSigner: (value: string) => void;
}

export const AddressContext = createContext<State>({ all: [], addresses: [], signers: [] } as unknown as State);

function AddressProvider({ children }: React.PropsWithChildren) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { addresses: signers } = useAccount();

  const isSigner = useCallback((value: string) => signers?.includes(value as Address), [signers]);

  const all = useMemo(() => addresses.concat(signers || []), [addresses, signers]);

  const value = useMemo((): State => ({ isSigner, addresses, signers: [...(signers || [])], all }), [addresses, all, isSigner, signers]);

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export default AddressProvider;
