// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useContext, useMemo } from 'react';

import { useCurrentChain } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

type GroupAccount = {
  all: Address[];
  currentChainAll: Address[];
  multisigs: Address[];
  currentChainMultisigs: Address[];
  watchList: Address[];
  address: Address[];
  signers: Address[];
};

export function useGroupAccounts(): GroupAccount {
  const [chainId] = useCurrentChain();
  const { multisigs, watchlist, signers, addresses } = useContext(AddressContext);

  return useMemo(() => {
    const multisigsAddr = Object.keys(multisigs) as Address[];
    const watchOnlyList = Object.keys(watchlist) as Address[];
    const currentChainMultisigs = Object.values(multisigs)
      .flat()
      .filter((item) => !item.readonly && item.chainId === chainId)
      .map((item) => item.address);

    return {
      all: Array.from(new Set(multisigsAddr.concat(signers).concat(addresses).concat(watchOnlyList))),
      currentChainAll: Array.from(
        new Set(currentChainMultisigs.concat(signers).concat(addresses).concat(watchOnlyList))
      ),
      multisigs: multisigsAddr,
      currentChainMultisigs: Array.from(new Set(currentChainMultisigs)),
      watchList: watchOnlyList,
      address: addresses,
      signers
    };
  }, [addresses, chainId, multisigs, signers, watchlist]);
}
