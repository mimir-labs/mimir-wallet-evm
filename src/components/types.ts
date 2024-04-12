// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';

export type EnableClickHandler = (wallet: WalletClient<Transport, Chain, Account>, client: PublicClient<Transport, Chain>) => void;
