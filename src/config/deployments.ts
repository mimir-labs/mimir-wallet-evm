// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';

export interface DeploymentType {
  CompatibilityFallbackHandler: [Address, ...Address[]];
  MultiSend: [Address, ...Address[]];
  MultiSendCallOnly: [Address, ...Address[]];
  Safe: [Address, ...Address[]];
  SafeL2: [Address, ...Address[]];
  SafeProxyFactory: [Address, ...Address[]];
  SimulateTxAccessor: [Address, ...Address[]];
}

export interface ModuleDeploymentType {
  ModuleProxyFactory: [Address, ...Address[]];
  Allowance: [Address, ...Address[]];
  Delay: [Address, ...Address[]];
}

const deployments130Addresses: Record<string, Record<keyof DeploymentType, Address>> = {
  canonical: {
    CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
    MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
    Safe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    SafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    SafeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    SimulateTxAccessor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
  },
  eip155: {
    CompatibilityFallbackHandler: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
    MultiSend: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
    MultiSendCallOnly: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
    Safe: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
    SafeL2: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
    SafeProxyFactory: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
    SimulateTxAccessor: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
  },
  zksync: {
    CompatibilityFallbackHandler: '0x2f870a80647BbC554F3a0EBD093f11B4d2a7492A',
    MultiSend: '0x0dFcccB95225ffB03c6FBB2559B530C2B7C8A912',
    MultiSendCallOnly: '0xf220D3b4DFb23C4ade8C88E526C1353AbAcbC38F',
    Safe: '0xB00ce5CCcdEf57e539ddcEd01DF43a13855d9910',
    SafeL2: '0x1727c2c531cf966f902E5927b98490fDFb3b2b70',
    SafeProxyFactory: '0xDAec33641865E4651fB43181C6DB6f7232Ee91c2',
    SimulateTxAccessor: '0x4191E2e12E8BC5002424CE0c51f9947b02675a44'
  }
};

export const moduleDeployments: Record<number, ModuleDeploymentType> = {
  1: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  10: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  42: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  44: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  46: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  56: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  137: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  169: {
    ModuleProxyFactory: ['0xFE6F94Ca39CA2E44681cfCABa1aAbc05f0b45B17'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xe224f2281b2CC1169FA2270E636F4D296347fd47']
  },
  252: {
    ModuleProxyFactory: ['0x5d91648185f3d5683a1fad8464d31035886f2ef3'],
    Allowance: ['0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xD921eB40D8960Daa16fa2b4738652D7793942cbF']
  },
  1284: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  1337: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  7000: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  8453: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  42_161: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  534_352: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  534_351: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  },
  111_55_111: {
    ModuleProxyFactory: ['0x000000000000aDdB49795b0f9bA5BC298cDda236'],
    Allowance: ['0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', '0xE46FE78DBfCa5E835667Ba9dCd3F3315E7623F8a'],
    Delay: ['0xd54895B1121A2eE3f37b502F507631FA1331BED6']
  }
};

export const deployments: Record<number, DeploymentType> = Object.entries({
  1: ['canonical', 'eip155'],
  10: ['eip155', 'canonical'],
  42: ['canonical'],
  44: ['eip155', 'canonical'],
  46: ['eip155', 'canonical'],
  56: ['canonical', 'eip155'],
  82: ['eip155'],
  137: ['canonical'],
  169: ['canonical'],
  252: ['eip155', 'canonical'],
  1284: ['canonical'],
  1337: ['canonical'],
  7000: ['eip155', 'canonical'],
  8453: ['eip155', 'canonical'],
  42_161: ['canonical'],
  534_351: ['canonical', 'eip155'],
  534_352: ['canonical'],
  111_55_111: ['eip155', 'canonical']
}).reduce<Record<number, DeploymentType>>((result, [chainId, tags]) => {
  result[Number(chainId)] = {
    CompatibilityFallbackHandler: tags.map((tag) => deployments130Addresses[tag].CompatibilityFallbackHandler) as [
      Address,
      ...Address[]
    ],
    MultiSend: tags.map((tag) => deployments130Addresses[tag].MultiSend) as [Address, ...Address[]],
    MultiSendCallOnly: tags.map((tag) => deployments130Addresses[tag].MultiSendCallOnly) as [Address, ...Address[]],
    Safe: tags.map((tag) => deployments130Addresses[tag].Safe) as [Address, ...Address[]],
    SafeL2: tags.map((tag) => deployments130Addresses[tag].SafeL2) as [Address, ...Address[]],
    SafeProxyFactory: tags.map((tag) => deployments130Addresses[tag].SafeProxyFactory) as [Address, ...Address[]],
    SimulateTxAccessor: tags.map((tag) => deployments130Addresses[tag].SimulateTxAccessor) as [Address, ...Address[]]
  };

  return result;
}, {});
