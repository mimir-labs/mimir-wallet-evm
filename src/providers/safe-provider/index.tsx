// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { SafeTransaction } from '@mimir-wallet/safe/types';

import { Modal } from '@nextui-org/react';
import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';

import { SafeTxModal } from '@mimir-wallet/components';

interface State {
  isApprove: boolean;
  safeTx: Omit<SafeTransaction, 'nonce'> & { nonce?: bigint };
  address: Address;
  signatures?: SignatureResponse[];
  website?: string;
}

interface Value {
  openTxModal: (state: State, onSuccess?: () => void, onClose?: () => void) => void;
}

export const SafeContext = createContext<Value>({} as unknown as Value);

function SafeProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<State>();
  const onSuccessRef = useRef<() => void>();
  const onCloseRef = useRef<() => void>();

  const openTxModal = useCallback(
    (state: State, onSuccess?: () => void, onClose?: () => void) => {
      setState(state);
      onSuccessRef.current = onSuccess;
      onCloseRef.current = onClose;
    },
    [setState]
  );

  const value = useMemo(() => ({ state, openTxModal }), [openTxModal, state]);

  const onClose = useCallback(() => {
    setState(undefined);
    onCloseRef.current?.();
  }, []);

  const onSuccess = useCallback(() => {
    setState(undefined);
    onSuccessRef.current?.();
  }, []);

  return (
    <SafeContext.Provider value={value}>
      {children}
      <Modal scrollBehavior='outside' isOpen={!!state} onClose={onClose}>
        {state && (
          <SafeTxModal
            website={state.website}
            isApprove={state.isApprove}
            onSuccess={onSuccess}
            onClose={onClose}
            address={state.address}
            safeTx={state.safeTx}
            signatures={state.signatures}
          />
        )}
      </Modal>
    </SafeContext.Provider>
  );
}

export default React.memo(SafeProvider);
