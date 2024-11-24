// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type Address, getAddress, isAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { CURRENT_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { addressEq, store } from '@mimir-wallet/utils';

import { querySync } from './utils';

async function _addMultisig(
  chainId: number,
  account: AccountResponse,
  setMultisigs: React.Dispatch<React.SetStateAction<Multisig[]>>
) {
  if (account.type === 'safe') {
    setMultisigs((value) =>
      value.find((item) => chainId === item.chainId && addressEq(item.address, account.address))
        ? value
        : [
            ...value,
            {
              address: account.address,
              chainId,
              name: account.name,
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

// @internal
export function useAddress(defaultCurrent?: Address) {
  const chainId = useChainId();

  const [isReady, setIsReady] = useState(false);
  const { address } = useAccount();
  const signers = useMemo(() => (address ? [address] : []), [address]);

  const [allMultisigs, setAllMultisigs] = useState<Multisig[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<Address | undefined>(
    defaultCurrent && isAddress(defaultCurrent) ? getAddress(defaultCurrent) : undefined
  );

  const urlAddress = searchParams.get('address');

  currentRef.current = urlAddress && isAddress(urlAddress) ? getAddress(urlAddress) : currentRef.current;

  const switchAddress = useCallback(
    (address: Address) => {
      currentRef.current = address;
      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set('address', address);

      setSearchParams(newSearchParams);

      store.set(`${CURRENT_ACCOUNT_KEY}:${chainId}`, address);
    },
    [chainId, searchParams, setSearchParams]
  );
  const addMultisig = useCallback(
    async (chainId: number, account: AccountResponse) => {
      _addMultisig(chainId, account, setAllMultisigs);
      switchAddress(account.address);
    },
    [switchAddress]
  );

  // sync multisig from server
  useEffect(() => {
    if (address) {
      querySync(chainId, address, setAllMultisigs)
        .then(() => {})
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [address, chainId]);

  const { current, other } = useMemo(
    () =>
      allMultisigs.reduce<Record<'current' | 'other', Multisig[]>>(
        (result, item) => {
          if (item.chainId === chainId) {
            result.current.push(item);
          } else {
            result.other.push(item);
          }

          return result;
        },
        { current: [], other: [] }
      ),
    [allMultisigs, chainId]
  );

  const isSigner = useCallback(
    (value: string) => (signers || []).findIndex((item) => addressEq(item, value)) > -1,
    [signers]
  );
  const isMultisig = useCallback(
    (value: string) => current.findIndex((item) => addressEq(item.address, value)) > -1,
    [current]
  );

  return {
    isReady,
    current: currentRef.current,
    signers: useMemo(() => [...(signers || [])], [signers]),
    isMultisig,
    isSigner,
    multisigs: current,
    otherChainMultisigs: other,
    addMultisig,
    changeName: useCallback(
      (chainId: number, address: string, name: string) =>
        setAllMultisigs((value) =>
          value.map((item) => (item.chainId === chainId && addressEq(item.address, address) ? { ...item, name } : item))
        ),
      []
    ),
    isCurrent: useCallback((value: string) => (currentRef.current ? addressEq(value, currentRef.current) : false), []),
    switchAddress
  };
}
