// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CURRENT_ACCOUNT_KEY, CURRENT_CHAINID_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

import { useCurrentChain } from './useCurrentChain';

export function useFollowAccounts() {
  const [, , walletChainId] = useCurrentChain();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const urlCurrent = searchParams.get('address');
    const urlChainId = searchParams.get('chainid');

    if (!urlCurrent || !urlChainId) {
      const newSearchParams = new URLSearchParams(searchParams);

      const currentChainId = (store.get(CURRENT_CHAINID_KEY) as number) || walletChainId;
      const localAddress = store.get(`${CURRENT_ACCOUNT_KEY}:${currentChainId}`) as string;

      newSearchParams.set('chainid', currentChainId.toString());

      if (localAddress) {
        newSearchParams.set('address', localAddress);
      } else {
        newSearchParams.delete('address');
      }

      setSearchParams(newSearchParams, { replace: true });
    }
  }, [walletChainId, searchParams, setSearchParams]);
}
