// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Permission, PermissionRequest } from '@safe-global/safe-apps-sdk/dist/types/types/permissions';
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import type { MutableRefObject } from 'react';
import type { SafePermissionsRequest } from './types';

import {
  AddressBookItem,
  ChainInfo,
  EIP712TypedData,
  EnvironmentInfo,
  GetBalanceParams,
  GetTxBySafeTxHashParams,
  Methods,
  RequestId,
  RPC_CALLS,
  RPCPayload,
  SafeBalances,
  SafeInfo,
  SafeSettings,
  SendTransactionRequestParams,
  SendTransactionsParams,
  SignMessageParams,
  SignTypedMessageParams
} from '@safe-global/safe-apps-sdk';
import { useEffect, useState } from 'react';
import { getAddress, Hex } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';

import AppCommunicator from '@mimir-wallet/features/safe-apps/AppCommunicator';
import { MetaTransaction, Operation } from '@mimir-wallet/safe/types';

export enum CommunicatorMessages {
  REJECT_TRANSACTION_MESSAGE = 'Transaction was rejected'
}

type JsonRpcResponse = {
  jsonrpc: string;
  id: number;
  result?: unknown;
  error?: string;
};

export type UseAppCommunicatorHandlers = {
  onConfirmTransactions: (txs: MetaTransaction[], requestId: RequestId, params?: SendTransactionRequestParams) => void;
  onSignMessage: (
    message: string | EIP712TypedData,
    requestId: string,
    method: Methods.signMessage | Methods.signTypedMessage,
    sdkVersion: string
  ) => void;
  onGetTxBySafeTxHash: (hash: string) => Promise<TransactionDetails>;
  onGetEnvironmentInfo: () => EnvironmentInfo;
  onGetSafeBalances: (currency: string) => Promise<SafeBalances>;
  onGetSafeInfo: () => SafeInfo;
  onGetChainInfo: () => ChainInfo | undefined;
  onGetPermissions: (origin: string) => Permission[];
  onSetPermissions: (permissionsRequest?: SafePermissionsRequest) => void;
  onRequestAddressBook: (origin: string) => AddressBookItem[];
  onSetSafeSettings: (settings: SafeSettings) => SafeSettings;
  onGetOffChainSignature: (messageHash: string) => Promise<string | undefined>;
};

const useAppCommunicator = (
  iframeRef: MutableRefObject<HTMLIFrameElement | null>,
  handlers: UseAppCommunicatorHandlers
): AppCommunicator | undefined => {
  const [communicator, setCommunicator] = useState<AppCommunicator | undefined>(undefined);
  const chainId = useChainId();
  const safeAppWeb3Provider = usePublicClient({ chainId });

  useEffect(() => {
    let communicatorInstance: AppCommunicator;

    const initCommunicator = (iframeRef: MutableRefObject<HTMLIFrameElement | null>) => {
      communicatorInstance = new AppCommunicator(iframeRef, {
        onError: (error) => {
          console.error(error);
        }
      });

      setCommunicator(communicatorInstance);
    };

    initCommunicator(iframeRef);

    return () => {
      communicatorInstance?.clear();
    };
  }, [iframeRef]);

  // Adding communicator logic for the required SDK Methods
  // We don't need to unsubscribe from the events because there can be just one subscription
  // per event type and the next effect run will simply replace the handlers
  useEffect(() => {
    communicator?.on(Methods.getTxBySafeTxHash, (msg) => {
      const { safeTxHash } = msg.data.params as GetTxBySafeTxHashParams;

      return handlers.onGetTxBySafeTxHash(safeTxHash);
    });

    communicator?.on(Methods.getEnvironmentInfo, handlers.onGetEnvironmentInfo);

    communicator?.on(Methods.getSafeInfo, handlers.onGetSafeInfo);

    communicator?.on(Methods.getSafeBalances, (msg) => {
      const { currency = 'usd' } = msg.data.params as GetBalanceParams;

      return handlers.onGetSafeBalances(currency);
    });

    communicator?.on(Methods.rpcCall, async (msg) => {
      const params = msg.data.params as RPCPayload;

      if (params.call === RPC_CALLS.safe_setSettings) {
        const settings = params.params[0] as SafeSettings;

        return handlers.onSetSafeSettings(settings);
      }

      if (!safeAppWeb3Provider) {
        throw new Error('SafeAppWeb3Provider is not initialized');
      }

      try {
        return await safeAppWeb3Provider.request({ method: params.call, params: params.params as unknown as any });
      } catch (err) {
        throw new Error((err as JsonRpcResponse).error);
      }
    });

    communicator?.on(Methods.sendTransactions, (msg) => {
      const { txs, params } = msg.data.params as SendTransactionsParams;

      const transactions: MetaTransaction[] = txs.map(({ to, value, data }) => {
        return {
          to: getAddress(to),
          value: BigInt(value),
          data: (data as Hex) || '0x',
          operation: Operation.Call
        };
      });

      handlers.onConfirmTransactions(transactions, msg.data.id, params);
    });

    communicator?.on(Methods.signMessage, (msg) => {
      const { message } = msg.data.params as SignMessageParams;
      const { sdkVersion } = msg.data.env;

      handlers.onSignMessage(message, msg.data.id, Methods.signMessage, sdkVersion);
    });

    communicator?.on(Methods.getOffChainSignature, (msg) => {
      return handlers.onGetOffChainSignature(msg.data.params as string);
    });

    communicator?.on(Methods.signTypedMessage, (msg) => {
      const { typedData } = msg.data.params as SignTypedMessageParams;
      const { sdkVersion } = msg.data.env;

      handlers.onSignMessage(typedData, msg.data.id, Methods.signTypedMessage, sdkVersion);
    });

    communicator?.on(Methods.getChainInfo, handlers.onGetChainInfo);

    communicator?.on(Methods.wallet_getPermissions, (msg) => {
      return handlers.onGetPermissions(msg.origin);
    });

    communicator?.on(Methods.wallet_requestPermissions, (msg) => {
      handlers.onSetPermissions({
        origin: msg.origin,
        request: msg.data.params as PermissionRequest[],
        requestId: msg.data.id
      });
    });

    communicator?.on(Methods.requestAddressBook, (msg) => {
      return handlers.onRequestAddressBook(msg.origin);
    });
  }, [communicator, handlers, safeAppWeb3Provider]);

  return communicator;
};

export default useAppCommunicator;
