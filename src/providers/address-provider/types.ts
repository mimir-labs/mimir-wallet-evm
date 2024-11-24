// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, PublicClient } from 'viem';
import type { Multisig, SafeAccount } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

export interface State {
  isReady: boolean;
  current: Address | undefined;
  all: Address[];
  addresses: Address[];
  addressNames: Record<string, string>;
  queryCache: Record<Address, SafeAccount>;
  customTokens: CustomToken[];
  addressIcons: Record<number, Record<string, string>>;
  signers: Address[];
  multisigs: Multisig[];
  otherChainMultisigs: Multisig[];
  watchOnlyList: Address[];
  isSigner: (value: string) => boolean;
  isMultisig: (value: string) => boolean;
  isCurrent: (value: string) => boolean;
  changeName: (chainId: number, address: string, name: string) => void;
  addMultisig: (chainId: number, account: AccountResponse, client?: PublicClient) => Promise<void>;
  switchAddress: (address: Address) => void;
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
