// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Allowance } from './types';

import { zeroAddress } from 'viem';
import { useChainId, useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { moduleDeployments } from '@mimir-wallet/config';

export function useDelegateAllowance(
  safeAddress?: Address,
  delegate?: Address,
  token: Address = zeroAddress
): Allowance | undefined {
  const chainId = useChainId();

  const { data: tokenAllowance } = useReadContract({
    chainId,
    address: moduleDeployments[chainId].Allowance[0],
    abi: abis.Allowance,
    functionName: 'getTokenAllowance',
    args: safeAddress && delegate ? [safeAddress, delegate, token] : undefined
  });

  return tokenAllowance as Allowance | undefined;
}
