// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address } from 'abitype';

import { useQueryAccount } from '@mimir-wallet/hooks';

export function Query({ address }: { address: Address }) {
  useQueryAccount(address, false, 3);

  return null;
}
