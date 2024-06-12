// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { JsonRpcError, JsonRpcResponse } from '@walletconnect/jsonrpc-utils';
import type { SessionTypes } from '@walletconnect/types';
import type Web3WalletType from '@walletconnect/web3wallet';
import type { Address } from 'abitype';

import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';

import { supportedChains } from '@mimir-wallet/config';
import { LS_NAMESPACE, WALLET_CONNECT_PROJECT_ID } from '@mimir-wallet/constants';
import { assert } from '@mimir-wallet/utils';

import { EIP155, MIMIR_WALLET_METADATA, SESSION_ADD_EVENT, SESSION_REJECT_EVENT } from './constants';
import { getEip155ChainId } from './utils';

// eslint-disable-next-line import/no-mutable-exports
export let web3Wallet: Web3WalletType;

function assertWeb3Wallet() {
  assert(web3Wallet, 'WalletConnect not initialized');
}

// @internal only call once when app is initialize
export async function init(): Promise<Web3WalletType> {
  if (web3Wallet) return web3Wallet;

  const core = new Core({
    projectId: WALLET_CONNECT_PROJECT_ID,
    logger: process.env.NODE_ENV === 'production' ? undefined : 'debug',
    customStoragePrefix: LS_NAMESPACE
  });

  const instance = await Web3Wallet.init({
    core,
    metadata: MIMIR_WALLET_METADATA
  });

  web3Wallet = web3Wallet ? instance : web3Wallet;

  return web3Wallet;
}

export async function connect(uri: string) {
  assertWeb3Wallet();

  return web3Wallet.core.pairing.pair({ uri });
}

export async function chainChanged(topic: string, chainId: number) {
  const eipChainId = getEip155ChainId(chainId);

  return web3Wallet?.emitSessionEvent({
    topic,
    event: {
      name: 'chainChanged',
      data: Number(chainId)
    },
    chainId: eipChainId
  });
}

export async function accountsChanged(topic: string, chainId: number, address: string) {
  const eipChainId = getEip155ChainId(chainId);

  return web3Wallet?.emitSessionEvent({
    topic,
    event: {
      name: 'accountsChanged',
      data: [address]
    },
    chainId: eipChainId
  });
}

function _getNamespaces(proposal: Web3WalletTypes.SessionProposal, currentChainId: number, safeAddress: Address) {
  const eip155ChainIds = supportedChains.map((item) => getEip155ChainId(item.id));
  const eip155Accounts = eip155ChainIds.map((eip155ChainId) => `${eip155ChainId}:${safeAddress}`);

  const methods = [
    'eth_accounts',
    'eth_requestAccounts',
    'eth_sendRawTransaction',
    'eth_sign',
    'eth_signTransaction',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'eth_sendTransaction',
    'personal_sign'
    // 'wallet_switchEthereumChain'
    // "wallet_addEthereumChain",
    // "wallet_getPermissions",
    // "wallet_requestPermissions",
    // "wallet_registerOnboarding",
    // "wallet_watchAsset",
    // "wallet_scanQRCode",
    // "wallet_sendCalls",
    // "wallet_getCallsStatus",
    // "wallet_showCallsStatus",
    // "wallet_getCapabilities",
  ];
  const events = [
    'chainChanged',
    'accountsChanged',
    // "message",
    'disconnect',
    'connect'
  ];

  return buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces: {
      [EIP155]: {
        chains: eip155ChainIds,
        accounts: eip155Accounts,
        methods,
        events
      }
    }
  });
}

export async function approveSession(
  proposal: Web3WalletTypes.SessionProposal,
  currentChainId: number,
  safeAddress: Address
) {
  assertWeb3Wallet();

  const namespaces = _getNamespaces(proposal, currentChainId, safeAddress);

  // Approve the session proposal
  const session = await web3Wallet.approveSession({
    id: proposal.id,
    namespaces
  });

  await chainChanged(session.topic, currentChainId);

  // Workaround: WalletConnect doesn't have a session_add event
  web3Wallet.events.emit(SESSION_ADD_EVENT, session);
}

export async function rejectSession(proposal: Web3WalletTypes.SessionProposal) {
  assertWeb3Wallet();

  await web3Wallet.rejectSession({
    id: proposal.id,
    reason: getSdkError('USER_REJECTED')
  });

  // Workaround: WalletConnect doesn't have a session_reject event
  web3Wallet.events.emit(SESSION_REJECT_EVENT, proposal);
}

export async function disconnectSession(session: SessionTypes.Struct) {
  assertWeb3Wallet();

  await web3Wallet.disconnectSession({
    topic: session.topic,
    reason: getSdkError('USER_DISCONNECTED')
  });

  web3Wallet.events.emit('session_delete', session);
}

export function getActiveSessions(): SessionTypes.Struct[] {
  const sessionsMap = web3Wallet?.getActiveSessions() || {};

  return Object.values(sessionsMap);
}

async function updateSession(session: SessionTypes.Struct, chainId: number, safeAddress: string): Promise<void> {
  assertWeb3Wallet();

  const currentEip155ChainIds = session.namespaces[EIP155]?.chains || [];
  const currentEip155Accounts = session.namespaces[EIP155]?.accounts || [];

  const newEip155ChainId = getEip155ChainId(chainId);
  const newEip155Account = `${newEip155ChainId}:${safeAddress}`;

  const isUnsupportedChain = !currentEip155ChainIds.includes(newEip155ChainId);
  const isNewSessionSafe = !currentEip155Accounts.includes(newEip155Account);

  // Switching to unsupported chain
  if (isUnsupportedChain) {
    return disconnectSession(session);
  }

  // Add new Safe to the session namespace
  if (isNewSessionSafe) {
    const namespaces: SessionTypes.Namespaces = {
      [EIP155]: {
        ...session.namespaces[EIP155],
        chains: currentEip155ChainIds,
        accounts: [newEip155Account, ...currentEip155Accounts]
      }
    };

    await web3Wallet.updateSession({
      topic: session.topic,
      namespaces
    });
  }

  // Switch to the new chain
  await chainChanged(session.topic, chainId);

  // Switch to the new Safe
  await accountsChanged(session.topic, chainId, safeAddress);
}

export async function updateSessions(chainId: number, safeAddress: string) {
  for await (const session of getActiveSessions()) {
    await updateSession(session, chainId, safeAddress);
  }
}

export async function sendSessionResponse(topic: string, response: JsonRpcResponse<unknown>) {
  assertWeb3Wallet();

  return web3Wallet.respondSessionRequest({ topic, response });
}

export async function sendSessionError(topic: string, response: JsonRpcError) {
  assertWeb3Wallet();

  return web3Wallet.respondSessionRequest({ topic, response });
}
