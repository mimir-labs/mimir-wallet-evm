// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Hex } from 'viem';
import type { IWalletClient, Multisig } from '../types';

import { TypedDataTypes } from '../config';

export function signChangeName(wallet: IWalletClient, multisig: Multisig, name: string): Promise<Hex> {
  const domain = {
    chainId: wallet.chain.id,
    verifyingContract: multisig.address,
    name: 'ChangeName'
  } as const;

  const types = TypedDataTypes.changeName;

  return wallet.signTypedData({
    account: wallet.account,
    domain,
    types,
    primaryType: 'ChangeName',
    message: {
      oldName: multisig.name || '',
      newName: name
    }
  });
}
