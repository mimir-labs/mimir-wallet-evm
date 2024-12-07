// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SessionTypes } from '@walletconnect/types';
import type { Web3WalletTypes } from '@walletconnect/web3wallet';
import type { SafeMessage, SafeTransaction } from '@mimir-wallet/safe/types';

import { getSdkError } from '@walletconnect/utils';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Address, getAddress, hexToBigInt, hexToString } from 'viem';

import { useCurrentChain } from '@mimir-wallet/hooks';
import { AddressContext, SafeTxContext } from '@mimir-wallet/providers';
import { buildSafeTransaction, hashSafeTransaction } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import { SESSION_ADD_EVENT } from './constants';
import { WalletConnectState } from './types';
import {
  getActiveSessions,
  init,
  sendSessionError,
  sendSessionResponse,
  updateSessions,
  web3Wallet
} from './wallet-connect';

export const WalletConnectContext = createContext<WalletConnectState>({} as WalletConnectState);

function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  const [chainId] = useCurrentChain();
  const { current } = useContext(AddressContext);
  const { addTx, addMessage } = useContext(SafeTxContext);
  const [isReady, setReady] = useState(false);
  const [isError, setError] = useState(false);
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [sessionProposal, setSessionProposal] = useState<Web3WalletTypes.SessionProposal>();
  const handlerRef = useRef<(event: Web3WalletTypes.SessionRequest) => void>();

  handlerRef.current = async (event) => {
    const { id, topic, params } = event;
    const session = getActiveSessions().find((s) => s.topic === topic);

    if (params.request.method === 'eth_accounts') {
      return sendSessionResponse(topic, {
        jsonrpc: '2.0',
        id,
        result: current ? [getAddress(current)] : []
      });
    }

    if (params.request.method === 'eth_sendTransaction') {
      const { data, from, to, value } = params.request.params[0];

      if (!addressEq(from, current)) {
        return sendSessionError(topic, {
          jsonrpc: '2.0',
          id,
          error: getSdkError('UNSUPPORTED_ACCOUNTS')
        });
      }

      addTx({
        isApprove: false,
        isCancel: false,
        address: getAddress(from),
        tx: buildSafeTransaction(getAddress(to), {
          value: value ? hexToBigInt(value) : 0n,
          data: data || '0x'
        }),
        safeTx: undefined,
        cancelNonce: undefined,
        signatures: undefined,
        metadata: {
          website: session?.peer.metadata.url,
          iconUrl: session?.peer.metadata.icons?.[0],
          appName: session?.peer.metadata.name
        },
        onSuccess: (safeTx: SafeTransaction) => {
          sendSessionResponse(topic, {
            jsonrpc: '2.0',
            id,
            result: hashSafeTransaction(chainId, getAddress(from), safeTx)
          });
        },
        onClose: () => {
          sendSessionError(topic, {
            jsonrpc: '2.0',
            id,
            error: getSdkError('USER_REJECTED_METHODS')
          });
        }
      });
    } else if (params.request.method === 'personal_sign' || params.request.method === 'eth_signTypedData_v4') {
      let address: Address;
      let message: SafeMessage;

      if (params.request.method === 'eth_signTypedData_v4') {
        message = JSON.parse(params.request.params[1]);
        address = getAddress(params.request.params[0]);
      } else {
        message = hexToString(params.request.params[0]);
        address = getAddress(params.request.params[1]);
      }

      if (!addressEq(address, current)) {
        return sendSessionError(topic, {
          jsonrpc: '2.0',
          id,
          error: getSdkError('UNSUPPORTED_ACCOUNTS')
        });
      }

      addMessage({
        address,
        message,
        metadata: {
          website: session?.peer.metadata.url,
          iconUrl: session?.peer.metadata.icons?.[0],
          appName: session?.peer.metadata.name
        },
        requestId: id,
        onFinal: (signature) => {
          sendSessionResponse(topic, {
            jsonrpc: '2.0',
            id,
            result: signature
          });
        },
        onClose: () => {
          sendSessionError(topic, {
            jsonrpc: '2.0',
            id,
            error: getSdkError('USER_REJECTED_METHODS')
          });
        }
      });
    } else {
      return sendSessionError(topic, {
        jsonrpc: '2.0',
        id,
        error: getSdkError('UNAUTHORIZED_METHOD')
      });
    }
  };

  useEffect(() => {
    init()
      .then(() => {
        setReady(true);
        web3Wallet.on('session_proposal', setSessionProposal);
        web3Wallet.on('session_request', (event) => {
          handlerRef.current?.(event);
          setSessions(getActiveSessions());
        });
        web3Wallet.on(SESSION_ADD_EVENT, () => {
          setSessions(getActiveSessions());
          setSessionProposal(undefined);
        });
        web3Wallet.on('session_delete', () => {
          setSessions(getActiveSessions());
          setSessionProposal(undefined);
        });
        setSessions(getActiveSessions());
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  useEffect(() => {
    if (isReady && current) {
      updateSessions(chainId, current);
    }
  }, [chainId, current, isReady]);

  const deleteProposal = useCallback(() => {
    setSessionProposal(undefined);
  }, []);

  const state = useMemo(
    () => ({
      web3Wallet,
      isReady,
      isError,
      sessions,
      sessionProposal,
      deleteProposal
    }),
    [deleteProposal, isError, isReady, sessionProposal, sessions]
  );

  return <WalletConnectContext.Provider value={state}>{children}</WalletConnectContext.Provider>;
}

export default WalletConnectProvider;
