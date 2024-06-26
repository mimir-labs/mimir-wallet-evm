// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseSafeMessage, UseSafeTx } from '@mimir-wallet/components/safe-modal/types';

import React, { createContext, useCallback, useMemo, useState } from 'react';

interface TxItem {
  id: number;
  type: 'tx';
  data: UseSafeTx<boolean, boolean>;
}

interface MessageItem {
  id: number;
  type: 'message';
  data: UseSafeMessage;
}

interface State {
  state: (TxItem | MessageItem)[];
  addTx: (value: UseSafeTx<boolean, boolean>) => void;
  addMessage: (value: UseSafeMessage) => void;
}

export const SafeTxContext = createContext<State>({} as State);

let id = 0;

function SafeTxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(TxItem | MessageItem)[]>([]);

  const addTx = useCallback((value: UseSafeTx<boolean, boolean>) => {
    const _id = ++id;

    setState((_state) => {
      return [
        ..._state,
        {
          id: _id,
          type: 'tx',
          data: {
            ...value,
            isCancel: value.isCancel || !!value.metadata?.website?.startsWith('mimir://internal/cancel-tx'),
            onClose: () => {
              setState((_state) => _state.filter((item) => item.id !== _id));
              value.onClose?.();
            },
            onSuccess: (tx) => {
              setState((_state) => _state.filter((item) => item.id !== _id));
              value.onSuccess?.(tx);
            }
          }
        }
      ];
    });
  }, []);

  const addMessage = useCallback((value: UseSafeMessage) => {
    const _id = ++id;

    setState((_state) => {
      return [
        ..._state,
        {
          id: _id,
          type: 'message',
          data: {
            ...value,
            onClose: () => {
              setState((_state) => _state.filter((item) => item.id !== _id));
              value.onClose?.();
            },
            onSuccess: (tx) => {
              if (!value.onFinal) {
                setState((_state) => _state.filter((item) => item.id !== _id));
              }

              value.onSuccess?.(tx);
            },
            onFinal: (...args) => {
              setState((_state) => _state.filter((item) => item.id !== _id));

              value.onFinal?.(...args);
            }
          }
        }
      ];
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      addTx,
      addMessage
    }),
    [addTx, addMessage, state]
  );

  return <SafeTxContext.Provider value={value}>{children}</SafeTxContext.Provider>;
}

export default SafeTxProvider;
