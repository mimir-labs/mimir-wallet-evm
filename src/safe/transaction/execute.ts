// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { IPublicClient, IWalletClient, SafeTransaction } from '../types';

import { Hex } from 'viem';

import { abis } from '@mimir-wallet/abis';

export async function execute(
  wallet: IWalletClient,
  client: IPublicClient,
  safeAccount: Address,
  safeTx: SafeTransaction,
  signatures: Hex,
  sender?: Address
) {
  const result = await client.simulateContract({
    account: sender || wallet.account,
    address: safeAccount,
    abi: abis.SafeL2,
    functionName: 'execTransaction',
    args: [
      safeTx.to,
      safeTx.value,
      safeTx.data,
      safeTx.operation,
      safeTx.safeTxGas,
      safeTx.baseGas,
      safeTx.gasPrice,
      safeTx.gasToken,
      safeTx.refundReceiver,
      signatures
    ]
  });

  return wallet.writeContract(result.request);
}
