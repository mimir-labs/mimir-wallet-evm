// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, PublicClient } from 'viem';
import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { CURRENT_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { useQueryParam } from '@mimir-wallet/hooks';

import { initCurrent, querySync } from './utils';

interface State {
  isReady: boolean;
  current: Address | undefined;
  all: Address[];
  addresses: Address[];
  signers: Address[];
  multisigs: Multisig[];
  isSigner: (value: string) => boolean;
  isMultisig: (value: string) => boolean;
  isCurrent: (value: string) => boolean;
  changeName: (address: string, name: string) => void;
  addMultisig: (account: AccountResponse, client?: PublicClient) => Promise<void>;
  switchAddress: (address: Address) => void;
}

async function _addMultisig(account: AccountResponse, setMultisigs: React.Dispatch<React.SetStateAction<Multisig[]>>) {
  if (account.type === 'safe') {
    setMultisigs((value) =>
      value.find((item) => item.address.toLowerCase() === account.address.toLowerCase())
        ? value
        : [
            ...value,
            {
              name: account.name,
              address: account.address,
              isMimir: account.isMimir,
              createdAt: account.createdAt,
              updatedAt: account.updatedAt,
              members: account.members!,
              threshold: account.threshold!,
              singleton: account.singleton!,
              factory: account.factory!,
              version: account.version!,
              block: account.block!,
              transaction: account.transaction!,
              updateBlock: account.updateBlock,
              updateTransaction: account.updateTransaction
            }
          ]
    );
  }
}

export const AddressContext = createContext<State>({ all: [], addresses: [], signers: [] } as unknown as State);

function AddressProvider({ children }: React.PropsWithChildren) {
  const chainId = useChainId();

  const [isReady, setIsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { addresses: signers, address } = useAccount();

  const [multisigs, setMultisigs] = useState<Multisig[]>([]);
  const all = useMemo(
    () => addresses.concat(signers || []).concat(multisigs.map((item) => item.address)),
    [addresses, multisigs, signers]
  );
  const [current, setCurrent] = useState<Address>();
  const isSigner = useCallback(
    (value: string) => (signers || []).findIndex((item) => item.toLowerCase() === value.toLowerCase()) > -1,
    [signers]
  );
  const isMultisig = useCallback(
    (value: string) => multisigs.findIndex((item) => item.address.toLowerCase() === value.toLowerCase()) > -1,
    [multisigs]
  );
  const switchAddress = useCallback(
    (address: Address) => {
      setCurrent(address);
      localStorage.setItem(`${CURRENT_ACCOUNT_KEY}:${chainId}`, JSON.stringify(address));
    },
    [chainId]
  );
  const addMultisig = useCallback(
    async (account: AccountResponse) => {
      _addMultisig(account, setMultisigs);
      switchAddress(account.address);
    },
    [switchAddress]
  );
  const [, setQueryAddress] = useQueryParam('address');

  useEffect(() => {
    if (current) {
      setQueryAddress(current, { replace: true });
    }
  }, [current, setQueryAddress]);

  // sync multisig from server
  useEffect(() => {
    setIsReady(false);

    if (address) {
      querySync(chainId, address, setMultisigs, setCurrent).finally(() => setIsReady(true));
    } else {
      setCurrent(initCurrent(chainId, []));
      setIsReady(true);
    }
  }, [address, chainId]);

  const value = useMemo(
    (): State => ({
      isReady,
      current,
      isSigner,
      addresses,
      signers: [...(signers || [])],
      isMultisig,
      multisigs,
      all,
      addMultisig,
      changeName: (address: string, name: string) =>
        setMultisigs((value) =>
          value.map((item) => (item.address.toLowerCase() === address.toLowerCase() ? { ...item, name } : item))
        ),
      isCurrent: (value: string) => value.toLowerCase() === current?.toLowerCase(),
      switchAddress
    }),
    [current, addMultisig, addresses, all, isMultisig, isReady, isSigner, multisigs, signers, switchAddress]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export default AddressProvider;
