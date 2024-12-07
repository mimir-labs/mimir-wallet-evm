// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, PublicClient } from 'viem';
import type { TokenInfo } from '@mimir-wallet/hooks/types';
import type { Multisig, SafeAccount } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

export interface State {
  isReady: boolean;
  current: Address | undefined;
  tokens: TokenInfo[];
  addresses: Address[]; // address book in current chain
  addressNames: Record<string, string>; // address names address => name
  queryCache: Record<number, Record<Address, SafeAccount>>; // cache of query full account
  customTokens: CustomToken[];
  addressIcons: Record<number, Record<string, string>>; // address icons chainId => address => icon
  signers: Address[]; // signers
  multisigs: Record<string, Multisig[]>; // owned multisigs group by address, it has multiple chain
  watchlist: Record<string, Multisig[]>; // watched multisig list group by address, it has multiple chain
  isSigner: (value: string) => boolean;
  isReadOnly: (chainId: number, value: string) => boolean;
  changeName: (chainId: number, address: string, name: string) => void;
  addMultisig: (chainId: number, account: AccountResponse, client?: PublicClient) => Promise<void>;
  switchAddress: (chainId: number, address?: Address, to?: string) => void;
  addAddressBook: (value?: [address: Address, name: string]) => Promise<[address: Address, name: string]>;
  addCustomToken: (token: CustomToken) => void;
  setQueryCache: React.Dispatch<React.SetStateAction<Record<Address, SafeAccount>>>;
  addWatchOnlyList: (address?: Address) => void;
}

export interface CustomToken {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
}
