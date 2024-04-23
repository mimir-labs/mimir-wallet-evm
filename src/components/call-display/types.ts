// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hex } from 'viem';
import type { CallFunctions, ParsedCall } from '@mimir-wallet/hooks/types';

export interface CallDisplayProps {
  data: Hex;
  to?: Address;
  value?: bigint;
  parsed?: ParsedCall<CallFunctions>;
}
