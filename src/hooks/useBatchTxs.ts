// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from './types';

import { useCallback, useMemo } from 'react';
import { useChainId } from 'wagmi';

import { BATCH_TX_KEY } from '@mimir-wallet/constants';
import { events } from '@mimir-wallet/events';

import { useLocalStore } from './useStore';

type BatchTxs = Record<number, Record<string, BatchTxItem[]>>; // chainId => address => BatchTxItem[]

export function useBatchTxs(
  address?: string | null
): [
  txs: BatchTxItem[],
  addTx: (value: BatchTxItem) => void,
  deleteTx: (id: number) => void,
  setTx: (txs: BatchTxItem[]) => void
] {
  const [values, setValues] = useLocalStore<BatchTxs>(BATCH_TX_KEY, {});
  const chainId = useChainId();

  const txs = useMemo(() => (address ? values?.[chainId]?.[address] || [] : []), [address, chainId, values]);
  const addTx = useCallback(
    (value: BatchTxItem) => {
      if (!address) return;

      setValues((_values) => ({
        ...(_values || {}),
        [chainId]: {
          ...(_values?.[chainId] || {}),
          [address]: [...(_values?.[chainId]?.[address] || []), value]
        }
      }));
      events.emit('batch_tx_added', value);
    },
    [address, chainId, setValues]
  );
  const deleteTx = useCallback(
    (id: number) => {
      if (!address) return;

      setValues((_values) => ({
        ...(_values || {}),
        [chainId]: {
          ...(_values?.[chainId] || {}),
          [address]: (_values?.[chainId]?.[address] || []).filter((item) => item.id !== id)
        }
      }));
    },
    [address, chainId, setValues]
  );
  const setTx = useCallback(
    (txs: BatchTxItem[]) => {
      if (!address) return;

      setValues((_values) => ({
        ...(_values || {}),
        [chainId]: {
          ...(_values?.[chainId] || {}),
          [address]: txs
        }
      }));
    },
    [address, chainId, setValues]
  );

  return [txs, addTx, deleteTx, setTx];
}
