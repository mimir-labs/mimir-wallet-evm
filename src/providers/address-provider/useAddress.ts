// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { type Address, getAddress, isAddress } from 'viem';
import { useAccount, useSwitchChain } from 'wagmi';

import { CURRENT_ACCOUNT_KEY, CURRENT_CHAINID_KEY } from '@mimir-wallet/constants';
import { useCurrentChain, useLocalStore } from '@mimir-wallet/hooks';
import { addressEq, store } from '@mimir-wallet/utils';

import { querySync } from './utils';

async function _addMultisig(
  chainId: number,
  account: AccountResponse,
  setMultisigs: React.Dispatch<React.SetStateAction<Record<Address, Multisig[]>>>
) {
  if (account.type === 'safe') {
    setMultisigs((value) => ({
      ...value,
      [account.address]: [
        ...value[account.address],
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
    }));
  }
}

// @internal
export function useAddress() {
  const [currentChainId, , walletChainId] = useCurrentChain();
  const { switchChain } = useSwitchChain();
  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(false);
  const { address } = useAccount();
  const signers = useMemo(() => (address ? [address] : []), [address]);

  const [multisigs, setMultisigs] = useState<Record<string, Multisig[]>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAddress = searchParams.get('address');

  const [localAddress] = useLocalStore<Address>(`${CURRENT_ACCOUNT_KEY}:${currentChainId}`);

  const switchAddress = useCallback(
    (chainId: number, address?: Address, to?: string) => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (chainId !== currentChainId || walletChainId !== currentChainId) {
        switchChain({ chainId });
      }

      if (!address) {
        address = store.get(`${CURRENT_ACCOUNT_KEY}:${chainId}`) as Address | undefined;
      }

      if (address) {
        newSearchParams.set('address', address);
        newSearchParams.set('chainid', chainId.toString());
      } else {
        newSearchParams.delete('address');
        newSearchParams.set('chainid', chainId.toString());
      }

      if (to) {
        navigate({
          pathname: to,
          search: `?${newSearchParams.toString()}`
        });
      } else {
        setSearchParams(newSearchParams);
      }

      if (address) {
        store.set(`${CURRENT_ACCOUNT_KEY}:${chainId}`, address);
      } else {
        store.remove(`${CURRENT_ACCOUNT_KEY}:${chainId}`);
      }

      store.set(CURRENT_CHAINID_KEY, chainId);
    },
    [currentChainId, navigate, searchParams, setSearchParams, switchChain, walletChainId]
  );

  const addMultisig = useCallback(
    async (chainId: number, account: AccountResponse) => {
      _addMultisig(chainId, account, setMultisigs);
      switchAddress(chainId, account.address);
    },
    [switchAddress]
  );

  // sync multisig from server
  useEffect(() => {
    if (address) {
      querySync(address, setMultisigs)
        .then(() => {})
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [address]);

  const isSigner = useCallback(
    (value: string) => (signers || []).findIndex((item) => addressEq(item, value)) > -1,
    [signers]
  );
  const isReadOnly = useCallback(
    (chainId: number, value: string) => {
      const items = multisigs[value];

      if (items) {
        const item = items.find((item) => item.chainId === chainId);

        return item ? item?.readonly : true;
      }

      return true;
    },
    [multisigs]
  );

  const changeName = useCallback(
    (chainId: number, address: string, name: string) =>
      setMultisigs((value) => ({
        ...value,
        [address]: value[address]?.map((item) => (item.chainId === chainId ? { ...item, name } : item))
      })),
    []
  );

  return {
    isReady,
    current:
      urlAddress && isAddress(urlAddress)
        ? getAddress(urlAddress)
        : localAddress && isAddress(localAddress)
          ? getAddress(localAddress)
          : undefined,
    signers: useMemo(() => [...(signers || [])], [signers]),
    isReadOnly,
    isSigner,
    multisigs,
    addMultisig,
    changeName,
    switchAddress
  };
}
