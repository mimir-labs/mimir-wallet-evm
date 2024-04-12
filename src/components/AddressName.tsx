// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';

import React, { useMemo } from 'react';
import { useEnsName } from 'wagmi';

interface Props {
  address?: string | null | undefined;
  disableEns?: boolean;
  fallback?: React.ReactNode;
}

function AddressName({ fallback, disableEns, address }: Props) {
  const { data: ensName } = useEnsName({ address: disableEns ? undefined : (address as Address) || undefined });

  const addressDisplay = useMemo(() => (address ? address.slice(2, 8).toUpperCase() : 'None'), [address]);

  return ensName || fallback || addressDisplay;
}

export default React.memo(AddressName);
