// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenType } from '@safe-global/safe-apps-sdk';

import { Spinner } from '@nextui-org/react';
import React, { useCallback, useContext } from 'react';
import { parseUnits, zeroAddress } from 'viem';

import useAppCommunicator, { CommunicatorMessages } from '@mimir-wallet/features/safe-apps/useAppCommunicator';
import { useAccountTokens, useCurrentChain, useMultisig, useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext, SafeTxContext } from '@mimir-wallet/providers';
import { buildMultiSendSafeTx, hashSafeTransaction } from '@mimir-wallet/safe';
import { MetaTransaction, SafeMessage } from '@mimir-wallet/safe/types';
import { isSameUrl, service } from '@mimir-wallet/utils';

import Iframe from './Iframe';
import PendingTx from './PendingTx';
import useAppIsLoading from './useAppIsLoading';

interface Props {
  appUrl: string;
  iconUrl?: string;
  appName?: string;
  allowedFeaturesList: string;
}

function AppFrame({ appUrl, iconUrl, appName, allowedFeaturesList }: Props) {
  const { iframeRef, appIsLoading, setAppIsLoading } = useAppIsLoading();
  const [currentChainId, currentChain] = useCurrentChain();
  const { current } = useContext(AddressContext);
  const { addTx, addMessage } = useContext(SafeTxContext);
  const safeAccount = useQueryAccount(current);
  const multisig = useMultisig(current);
  const [data] = useAccountTokens(current);

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;

    if (!iframe || !isSameUrl(iframe.src, appUrl)) {
      return;
    }

    setAppIsLoading(false);
  }, [appUrl, iframeRef, setAppIsLoading]);
  const communicator = useAppCommunicator(iframeRef, {
    onConfirmTransactions: async (transactions, id) => {
      if (transactions.length === 0) {
        throw new Error('transactions not valid');
      }

      if (!current) {
        throw new Error('Not permission');
      }

      let tx: MetaTransaction;

      if (transactions.length > 1) {
        tx = buildMultiSendSafeTx(currentChain, transactions);
      } else {
        // eslint-disable-next-line prefer-destructuring
        tx = transactions[0];
      }

      addTx({
        isApprove: false,
        isCancel: false,
        address: current,
        tx,
        safeTx: undefined,
        cancelNonce: undefined,
        signatures: undefined,
        metadata: { website: appUrl, iconUrl, appName },
        onSuccess: (tx) => {
          communicator?.send({ safeTxHash: hashSafeTransaction(currentChainId, current, tx) }, id);
        },
        onClose: () => {
          communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, id, true);
        }
      });
    },
    onSignMessage: (message, id) => {
      if (!current) {
        throw new Error('Not permission');
      }

      addMessage({
        address: current,
        message: message as SafeMessage,
        onFinal: (signature, messageHash) => {
          communicator?.send({ messageHash, signature }, id);
        },
        onClose: () => {
          communicator?.send(CommunicatorMessages.REJECT_TRANSACTION_MESSAGE, id, true);
        }
      });
    },
    onGetTxBySafeTxHash: (hash) => {
      return service.getSafeTx(currentChainId, hash) as any;
    },
    onGetEnvironmentInfo: () => ({
      origin: document.location.origin
    }),
    onGetSafeBalances: async () => {
      return {
        fiatTotal: data.totalBalanceUsd,
        items: data.assets.map((item) => ({
          tokenInfo: {
            type: (item.tokenAddress === zeroAddress ? 'NATIVE_TOKEN' : 'ERC20') as TokenType,
            address: item.tokenAddress,
            decimals: item.decimals,
            symbol: item.symbol,
            name: item.name,
            logoUri: item.icon || ''
          },
          balance: parseUnits(item.balance, item.decimals).toString(),
          fiatBalance: item.balanceUsd,
          fiatConversion: item.price
        }))
      };
    },
    onGetSafeInfo: () => {
      if (!current) {
        throw new Error('Not support method');
      }

      return {
        safeAddress: safeAccount?.address || current,
        chainId: currentChainId,
        threshold: safeAccount?.threshold || 1,
        owners: safeAccount?.members?.map((item) => item.address) || [],
        isReadOnly: !multisig
      };
    },
    onGetChainInfo: () => {
      const chain = currentChain;

      if (chain) {
        return {
          chainName: chain.name,
          shortName: chain.nativeCurrency.symbol,
          chainId: chain.id.toString(),
          nativeCurrency: {
            ...chain.nativeCurrency,
            logoUri: chain.iconUrl
          },
          blockExplorerUriTemplate: {
            address: `${chain.blockExplorers.default}/address/{{address}}`,
            api: `${chain.blockExplorers.default.apiUrl}?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}`,
            txHash: `${chain.blockExplorers.default}/tx/{{txHash}}`
          }
        };
      }

      return undefined;
    },
    onGetPermissions: () => [],
    onSetPermissions: () => {},
    onRequestAddressBook: () => [],
    onSetSafeSettings: () => {
      throw new Error('Not support method');
    },
    onGetOffChainSignature: () => {
      throw new Error('Not support method');
    }
  });

  return (
    <div className='relative w-full h-full'>
      {appIsLoading && <Spinner className='absolute left-0 right-0 top-0 bottom-0 m-auto' />}

      <div
        style={{
          height: '100%',
          paddingBottom: 60,
          display: appIsLoading ? 'none' : 'block'
        }}
      >
        <Iframe appUrl={appUrl} allowedFeaturesList={allowedFeaturesList} iframeRef={iframeRef} onLoad={onIframeLoad} />

        {current && <PendingTx address={current} />}
      </div>
    </div>
  );
}

export default React.memo(AppFrame);
