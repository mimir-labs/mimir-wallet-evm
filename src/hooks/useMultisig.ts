// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { AddressContext } from '@mimir-wallet/providers';
import { Multisig } from '@mimir-wallet/safe/types';

export function useMultisig(address?: string): Multisig | undefined {
  const { multisigs } = useContext(AddressContext);

  return useMemo(
    () => multisigs.find((item) => item.address.toLowerCase() === address?.toLowerCase()),
    [address, multisigs]
  );
}
