// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useChainId } from 'wagmi';

import { PENDING_SAFE_TX_PREFIX } from '@mimir-wallet/constants';

import { TransactionStatus } from './types';
import { useSafeNonce } from './useSafeInfo';
import { useSessionStore } from './useStore';

export function useTxIsIndexing(address: Address, status: TransactionStatus, txNonce: bigint): boolean {
  const [onChainNonce] = useSafeNonce(address);
  const chainId = useChainId();
  const key = `${PENDING_SAFE_TX_PREFIX}${chainId}:${address}:${txNonce}`;
  const [isIndexing] = useSessionStore<boolean>(key);

  return status === TransactionStatus.Pending ? !!isIndexing || txNonce < (onChainNonce || 0n) : false;
}
