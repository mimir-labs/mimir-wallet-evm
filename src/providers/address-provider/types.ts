// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, PublicClient } from 'viem';
import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

export interface State {
  isReady: boolean;
  current: Address | undefined;
  all: Address[];
  addresses: Address[];
  addressNames: Record<string, string>;
  addressThresholds: Record<string, [number, number]>;
  customTokens: CustomToken[];
  addressIcons: Record<number, Record<string, string>>;
  signers: Address[];
  multisigs: Multisig[];
  isSigner: (value: string) => boolean;
  isMultisig: (value: string) => boolean;
  isCurrent: (value: string) => boolean;
  changeName: (address: string, name: string) => void;
  addMultisig: (account: AccountResponse, client?: PublicClient) => Promise<void>;
  switchAddress: (address: Address) => void;
  addAddressBook: (value?: [address: Address, name: string]) => Promise<[address: Address, name: string]>;
  addCustomToken: (token: CustomToken) => void;
  setAddressThresholds: React.Dispatch<React.SetStateAction<Record<string, [number, number]>>>;
}

export interface CustomToken {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
}
