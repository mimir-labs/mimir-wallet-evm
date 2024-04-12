// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Chain, ContractFunctionArgs, Hex } from 'viem';

import { randomBytes } from 'crypto';
import { bytesToBigInt, encodeFunctionData, zeroAddress } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';
import { assert } from '@mimir-wallet/utils';

type Setup = {
  owners: Address[];
  threshold: bigint;
  to?: Address;
  data?: Hex;
  fallbackHandler?: Address;
  paymentToken?: Address;
  payment?: bigint;
  paymentReceiver?: Address;
};

export type CreateSafeRequest = {
  address: Address;
  abi: typeof abis.SafeProxyFactory;
  functionName: 'createProxyWithNonce';
  args: ContractFunctionArgs<typeof abis.SafeProxyFactory, 'nonpayable', 'createProxyWithNonce'>;
  account: Address;
};

export function createSetupCall({ owners, threshold, to, data, fallbackHandler, paymentToken, payment, paymentReceiver }: Setup): Hex {
  if (payment && payment > 0n) {
    if (!paymentToken || paymentToken === zeroAddress) {
      throw new Error('Must provide paymentToken');
    }

    if (!paymentReceiver || paymentReceiver === zeroAddress) {
      throw new Error('Must provide paymentReceiver');
    }
  }

  return encodeFunctionData({
    abi: abis.SafeL2,
    functionName: 'setup',
    args: [owners, threshold, to || zeroAddress, data || '0x', fallbackHandler || zeroAddress, paymentToken || zeroAddress, payment || 0n, paymentReceiver || zeroAddress]
  });
}

export function createSafeRequest(
  chain: Chain,
  account: Address,
  setup: Setup,
  factory: Address = deployments[chain.id].SafeProxyFactory,
  singleton: Address = deployments[chain.id].SafeL2,
  salt: bigint = bytesToBigInt(randomBytes(32))
): CreateSafeRequest {
  assert(factory && singleton, `Not supported chain: ${chain.name}`);

  const request = {
    address: factory,
    abi: abis.SafeProxyFactory,
    functionName: 'createProxyWithNonce',
    args: [singleton, createSetupCall(setup), salt],
    account
  } as const;

  return request;
}
