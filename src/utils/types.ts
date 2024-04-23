// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hash } from 'viem';
import type { AccountType } from '@mimir-wallet/safe/types';

export interface AccountResponse {
  name: string;
  address: Address;
  isMimir: boolean;
  createdAt: number;
  updatedAt: number;
  type?: AccountType;
  members?: Address[];
  threshold?: number;
  singleton?: Address;
  factory?: Address;
  version?: string;
  block?: number;
  transaction?: Hash;
  updateBlock?: number;
  updateTransaction?: Hash;
}
