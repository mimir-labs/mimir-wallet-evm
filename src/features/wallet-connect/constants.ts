// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Web3WalletTypes } from '@walletconnect/web3wallet';

export const EIP155 = 'eip155' as const;

export const MIMIR_WALLET_METADATA = {
  name: 'Mimir Wallet',
  url: 'https://dev-evm.mimir.global',
  description: 'Smart contract wallet for Ethereum',
  icons: ['https://dev-evm.mimir.global/images/logo-circle.png']
};

export const SESSION_ADD_EVENT = 'session_add' as Web3WalletTypes.Event;
export const SESSION_REJECT_EVENT = 'session_reject' as Web3WalletTypes.Event;
