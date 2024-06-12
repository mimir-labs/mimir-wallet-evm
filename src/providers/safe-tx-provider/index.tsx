// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useCallback, useMemo, useState } from 'react';

import { UseSafeTx } from '@mimir-wallet/components/safe-tx-modal/types';

interface State {
  state: (UseSafeTx<boolean, boolean> & { id: number })[];
  addTx: (value: UseSafeTx<boolean, boolean>) => void;
}

export const SafeTxContext = createContext<State>({} as State);

let id = 0;

function SafeTxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(UseSafeTx<boolean, boolean> & { id: number })[]>([]);

  const addTx = useCallback((value: UseSafeTx<boolean, boolean>) => {
    const _id = ++id;

    setState((_state) => {
      return [
        ..._state,
        {
          id: _id,
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
      ];
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      addTx
    }),
    [addTx, state]
  );

  return <SafeTxContext.Provider value={value}>{children}</SafeTxContext.Provider>;
}

export default SafeTxProvider;
