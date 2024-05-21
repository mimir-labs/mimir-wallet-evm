// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type {
  IPublicClient,
  IWalletClient,
  MetaTransaction,
  Multisig,
  SafeTransaction
} from '@mimir-wallet/safe/types';

export interface AssetChange {
  from: Address;
  to: Address;
  amount: bigint;
  tokenAddress: Address;
  logo?: string;
}

export interface Simulation {
  assetChange: AssetChange[];
  isError: boolean;
  isSuccess: boolean;
  isPending: boolean;
  isIdle: boolean;
}

export interface SafeTxState {
  isApprove: boolean;
  isCancel: boolean;
  hasSameTx: boolean;
  signatures: SignatureResponse[];
  multisig?: Multisig;
  address: Address;
  filterPaths: Array<Address[]>;
  tx: MetaTransaction;
  safeTx?: SafeTransaction;
  setCustomNonce: React.Dispatch<React.SetStateAction<bigint | undefined>>;
  addressChain: Address[];
  setAddressChain: React.Dispatch<React.SetStateAction<Address[]>>;
  executable: boolean;
  isSignatureReady: boolean;
  isNextSignatureReady: boolean;

  simulation: Simulation;

  onClose?: () => void;
  handleSign: (wallet: IWalletClient, client: IPublicClient) => Promise<void>;
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => Promise<void>;
  handleSignAndExecute: (wallet: IWalletClient, client: IPublicClient) => Promise<void>;
}

export interface UseSafeTx<Approve extends boolean, Cancel extends boolean> {
  isApprove: Approve;
  isCancel: Cancel;
  address: Address;
  tx: MetaTransaction;
  safeTx: Approve extends true ? SafeTransaction : undefined;
  cancelNonce: Cancel extends true ? bigint : undefined;
  signatures: Approve extends true ? SignatureResponse[] : undefined;
  filterPaths?: Array<Address[]>;
  website?: string;
  addressChain?: Address[];
  onSuccess?: (safeTx: SafeTransaction) => void;
  onClose?: () => void;
}
