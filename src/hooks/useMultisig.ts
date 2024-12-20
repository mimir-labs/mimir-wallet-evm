// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { useCurrentChain } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { Multisig } from '@mimir-wallet/safe/types';

export function useMultisig(address?: string): Multisig | undefined {
  const [chainId] = useCurrentChain();
  const { multisigs } = useContext(AddressContext);

  return useMemo(
    () => (address ? multisigs[address]?.find((item) => item.chainId === chainId) : undefined),
    [address, chainId, multisigs]
  );
}
