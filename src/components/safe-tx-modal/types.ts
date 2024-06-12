// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type {
  BaseAccount,
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
  hasSameTx: boolean;
  multisig?: Multisig;
  filterPaths: Array<Address[]>;
  safeAccount?: BaseAccount | null;
  safeTx?: SafeTransaction;
  onChainNonce?: bigint;
  setCustomNonce: React.Dispatch<React.SetStateAction<bigint | undefined>>;
  addressChain: Address[];
  setAddressChain: React.Dispatch<React.SetStateAction<Address[]>>;
  executable: boolean;
  isSignatureReady: boolean;
  isNextSignatureReady: boolean;

  simulation: Simulation;

  refetch: () => void;
  handleSign: (wallet: IWalletClient, client: IPublicClient) => Promise<void>;
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => Promise<void>;
}

export interface UseSafeTx<Approve extends boolean, Cancel extends boolean> {
  isApprove: Approve;
  isCancel: Cancel;
  address: Address;
  tx: MetaTransaction;
  safeTx: Approve extends true ? SafeTransaction : undefined;
  cancelNonce: Cancel extends true ? bigint : undefined;
  signatures: Approve extends true ? SignatureResponse[] : undefined;
  metadata?: { website?: string; iconUrl?: string; appName?: string };
  addressChain?: Address[];
  onSuccess?: (safeTx: SafeTransaction) => void;
  onClose?: () => void;
}
