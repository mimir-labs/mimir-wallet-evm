// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, IWalletClient, SafeTransaction } from '../types';

import { type Address, type Hex, isAddressEqual } from 'viem';

import { getOwners } from '../account';
import { TypedDataTypes } from '../config';
import { encodeSafeTransaction } from '../transaction';

export async function signSafeTransaction(
  wallet: IWalletClient,
  client: IPublicClient,
  safeAddress: Address,
  safeTransaction: SafeTransaction,
  signer: Address = wallet.account.address,
  addressChain: Address[] = []
): Promise<Hex> {
  if (!addressChain || addressChain.length === 0) {
    addressChain = [signer];
  }

  if (addressChain.length < 2) {
    return wallet.signTypedData({
      account: signer,
      domain: {
        chainId: wallet.chain.id,
        verifyingContract: safeAddress
      } as const,
      types: TypedDataTypes.safeTx,
      primaryType: 'SafeTx',
      message: safeTransaction
    });
  }

  const messageData = encodeSafeTransaction(wallet.chain, safeAddress, safeTransaction);

  let address = safeAddress;

  for (let i = 0; i < addressChain.length; i++) {
    const owners = await getOwners(client, address);

    const _address = owners.find((item) => isAddressEqual(item, addressChain[i]));

    if (!_address) {
      throw new Error(`${addressChain[i]} is not owner of ${address}`);
    }

    if (isAddressEqual(_address, signer)) {
      return wallet.signTypedData({
        account: signer,
        domain: {
          chainId: wallet.chain.id,
          verifyingContract: address
        } as const,
        types: TypedDataTypes.safeMessage,
        primaryType: 'SafeMessage',
        message: { message: messageData }
      });
    }

    address = _address;
  }

  throw new Error('Can not sign');
}
