// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

export type Allowance = [amount: bigint, spent: bigint, resetTimeMin: bigint, lastResetMin: bigint, nonce: bigint];

export type TokenAllowance = {
  delegate: Address;
  token: Address;
  allowance: Allowance;
};
