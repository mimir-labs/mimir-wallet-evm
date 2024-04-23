// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { sepolia } from 'viem/chains';

type Deployments = {
  CompatibilityFallbackHandler: Address;
  MultiSend: Address;
  MultiSendCallOnly: Address;
  SafeL2: Address;
  SafeProxyFactory: Address;
  SimulateTxAccessor: Address;
  modules: {
    Allowance: Address;
  };
};

export const deployments: Record<number, Deployments> = {
  [sepolia.id]: {
    CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
    MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    SafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    SafeProxyFactory: '0x7Ec60b29C1c201C7F1C97C42e3edbA3E8f905360',
    SimulateTxAccessor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
    modules: {
      Allowance: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'
    }
  }
};
