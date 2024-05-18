// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';
import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { CURRENT_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { useQueryParam } from '@mimir-wallet/hooks';
import { addressEq, store } from '@mimir-wallet/utils';

import { querySync } from './utils';

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

// @internal
export function useAddress(defaultCurrent?: Address) {
  const chainId = useChainId();

  const [isReady, setIsReady] = useState(false);
  const { address } = useAccount();
  const signers = useMemo(() => (address ? [address] : []), [address]);

  const [multisigs, setMultisigs] = useState<Multisig[]>([]);
  const [current, setCurrent] = useState<Address | undefined>(defaultCurrent);
  const isSigner = useCallback(
    (value: string) => (signers || []).findIndex((item) => addressEq(item, value)) > -1,
    [signers]
  );
  const isMultisig = useCallback(
    (value: string) => multisigs.findIndex((item) => addressEq(item.address, value)) > -1,
    [multisigs]
  );
  const switchAddress = useCallback(
    (address: Address) => {
      setCurrent(address);
      store.set(`${CURRENT_ACCOUNT_KEY}:${chainId}`, JSON.stringify(address));
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
  const [urlAddress, setQueryAddress] = useQueryParam('address');
  const [urlChainid, setQueryChainId] = useQueryParam('chainid');

  useEffect(() => {
    if (current) {
      if (current !== urlAddress) setQueryAddress(current, { replace: true });
    } else {
      setQueryAddress(undefined, { replace: true });
    }
  }, [current, setQueryAddress, urlAddress]);
  useEffect(() => {
    if (urlChainid !== chainId.toString()) setQueryChainId(chainId.toString(), { replace: true });
  }, [chainId, setQueryChainId, urlChainid]);

  // sync multisig from server
  useEffect(() => {
    if (address) {
      querySync(chainId, address, setMultisigs)
        .then((multisigs) => {
          setCurrent((value) => value || multisigs?.[0]?.address);
        })
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [address, chainId]);

  return {
    isReady,
    current,
    signers: useMemo(() => [...(signers || [])], [signers]),
    isMultisig,
    isSigner,
    multisigs,
    addMultisig,
    changeName: useCallback(
      (address: string, name: string) =>
        setMultisigs((value) => value.map((item) => (addressEq(item.address, address) ? { ...item, name } : item))),
      []
    ),
    isCurrent: useCallback((value: string) => (current ? addressEq(value, current) : false), [current]),
    switchAddress
  };
}
