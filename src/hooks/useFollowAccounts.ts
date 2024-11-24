// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useContext, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChainId } from 'wagmi';

import { AddressContext } from '@mimir-wallet/providers';

export function useFollowAccounts() {
  const chainid = useChainId();
  const { current } = useContext(AddressContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRef = useRef<Address | undefined>(current);
  const chainidRef = useRef<number>(chainid);

  currentRef.current = current;
  chainidRef.current = chainid;

  useEffect(() => {
    const urlCurrent = searchParams.get('address');
    const urlChainId = searchParams.get('chainid');

    if (!urlCurrent || !urlChainId) {
      const newSearchParams = new URLSearchParams(searchParams);

      if (currentRef.current) newSearchParams.set('address', currentRef.current);

      newSearchParams.set('chainid', chainidRef.current.toString());
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
}
