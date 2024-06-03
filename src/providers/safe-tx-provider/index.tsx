// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useCallback, useMemo, useState } from 'react';

import { UseSafeTx } from '@mimir-wallet/components/safe-tx-modal/types';

interface State {
  state?: UseSafeTx<boolean, boolean>;
  addTx: (value: UseSafeTx<boolean, boolean>) => void;
}

export const SafeTxContext = createContext<State>({} as State);

function SafeTxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UseSafeTx<boolean, boolean>>();

  const addTx = useCallback((value: UseSafeTx<boolean, boolean>) => {
    setState({
      ...value,
      isCancel: value.isCancel || value.website === 'mimir://internal/cancel-tx',
      onClose: () => {
        setState(undefined);
        value.onClose?.();
      },
      onSuccess: (tx) => {
        setState(undefined);
        value.onSuccess?.(tx);
      }
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
