// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useContext, useMemo } from 'react';
import { getAddress, isAddress } from 'viem';
import { useEnsName } from 'wagmi';

import { AddressContext } from '@mimir-wallet/providers';

export function useAddressName(
  chainId: number,
  address?: string | null,
  disableEns?: boolean,
  fallback?: React.ReactNode
): React.ReactNode {
  const { addressNames, multisigs } = useContext(AddressContext);
  const { data: ensName } = useEnsName({ address: disableEns ? undefined : (address as Address) || undefined });

  return useMemo(() => {
    if (!address) {
      return fallback;
    }

    if (!isAddress(address)) {
      return fallback;
    }

    if (ensName) {
      return ensName;
    }

    const addressName = addressNames[getAddress(address)] || addressNames[address.toLowerCase()];

    if (addressName) {
      return addressName;
    }

    const multisigsChain = multisigs[address];

    // get multisig name if exists
    if (multisigsChain) {
      const multisig = multisigsChain.find((item) => item.chainId === chainId) || multisigsChain[0];

      if (multisig?.name) {
        return multisig.name;
      }
    }

    return fallback || `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address, addressNames, chainId, ensName, fallback, multisigs]);
}
