// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { darwinia, moonbeam, scroll, scrollSepolia, sepolia } from 'viem/chains';

type ModuleDeployments = {
  ModuleProxyFactory: [Address, ...Address[]];
  Allowance: [Address, ...Address[]];
  Delay: [Address, ...Address[]];
};

type Deployments = {
  CompatibilityFallbackHandler: Address;
  MultiSend: Address;
  MultiSendCallOnly: Address;
  Safe: Address;
  SafeL2: Address;
  SafeProxyFactory: Address;
  SimulateTxAccessor: Address;
};

export const deployments: Record<number, Deployments> = {
  [sepolia.id]: {
    CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
    MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    Safe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    SafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    SafeProxyFactory: '0x7Ec60b29C1c201C7F1C97C42e3edbA3E8f905360',
    SimulateTxAccessor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
  },
  [moonbeam.id]: {
    CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
    MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    Safe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    SafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    SafeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    SimulateTxAccessor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
  },
  [scroll.id]: {
    CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
    MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    Safe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    SafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    SafeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    SimulateTxAccessor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
  },
  [scrollSepolia.id]: {
    CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
    MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    Safe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    SafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    SafeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    SimulateTxAccessor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
  },
  44: {
    CompatibilityFallbackHandler: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
    MultiSend: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
    MultiSendCallOnly: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
    Safe: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
    SafeL2: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
    SafeProxyFactory: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
    SimulateTxAccessor: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
  },
  [darwinia.id]: {
    CompatibilityFallbackHandler: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
    MultiSend: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
    MultiSendCallOnly: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
    Safe: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
    SafeL2: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
    SafeProxyFactory: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
    SimulateTxAccessor: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
  }
};

export const moduleDeployments: Record<number, ModuleDeployments> = {
  [sepolia.id]: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  [moonbeam.id]: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  [scroll.id]: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  [scrollSepolia.id]: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  44: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  [darwinia.id]: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  }
};
