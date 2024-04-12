// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';

import { sepolia } from 'viem/chains';

type Deployments = {
  CompatibilityFallbackHandler: Address;
  MultiSend: Address;
  MultiSendCallOnly: Address;
  SafeL2: Address;
  SafeProxyFactory: Address;
  SimulateTxAccessor: Address;
};

export const deployments: Record<number, Deployments> = {
  [sepolia.id]: {
    CompatibilityFallbackHandler: '0xf02dfD5568bC2149b6b5a119eEdBd76b100C3E82',
    MultiSend: '0x228a04A59BEF23106Bcb2b4158422baAC60646Ce',
    MultiSendCallOnly: '0x50cafDD5E439994509202CfCd569DcA7E1fd9659',
    SafeL2: '0xBF4417E6F1Bed2Be804F19B5e0289ea4b02F6170',
    SafeProxyFactory: '0x7Ec60b29C1c201C7F1C97C42e3edbA3E8f905360',
    SimulateTxAccessor: '0x38710E559A67ef07bcF8EeA70B076ac8e756DE08'
  }
};
