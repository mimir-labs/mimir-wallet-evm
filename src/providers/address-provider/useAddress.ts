// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';
import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { CURRENT_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { useQueryParam } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

import { initCurrent, querySync } from './utils';

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
export function useAddress() {
  const chainId = useChainId();

  const [isReady, setIsReady] = useState(false);
  const { addresses: signers, address } = useAccount();

  const [multisigs, setMultisigs] = useState<Multisig[]>([]);
  const [current, setCurrent] = useState<Address>();
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

  return {
    isReady,
    current,
    isSigner,
    signers: useMemo(() => [...(signers || [])], [signers]),
    isMultisig,
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
