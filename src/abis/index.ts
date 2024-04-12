// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CompatibilityFallbackHandler from './CompatibilityFallbackHandler';
import MultiSend from './MultiSend';
import MultiSendCallOnly from './MultiSendCallOnly';
import SafeL2 from './SafeL2';
import SafeProxyFactory from './SafeProxyFactory';
import SimulateTxAccessor from './SimulateTxAccessor';

export const abis = {
  CompatibilityFallbackHandler,
  MultiSend,
  MultiSendCallOnly,
  SafeL2,
  SafeProxyFactory,
  SimulateTxAccessor
};
