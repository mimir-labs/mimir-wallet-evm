// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useContext, useMemo } from 'react';
import { useEnsName } from 'wagmi';

import { AddressContext } from '@mimir-wallet/providers';

export function useAddressName(
  address?: string | null,
  disableEns?: boolean,
  fallback?: React.ReactNode
): React.ReactNode {
  const { multisigs, isMultisig } = useContext(AddressContext);
  const { data: ensName } = useEnsName({ address: disableEns ? undefined : (address as Address) || undefined });

  return useMemo(() => {
    if (!address) {
      return fallback;
    }

    const defaultName = fallback || `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      ensName ||
      (isMultisig(address)
        ? multisigs.find((item) => item.address.toLowerCase() === address.toLowerCase())?.name || defaultName
        : defaultName)
    );
  }, [address, ensName, fallback, isMultisig, multisigs]);
}
