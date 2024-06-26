// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hex } from 'viem';
import type { IPublicClient, IWalletClient, SafeMessage } from '../types';

import { addressEq } from '@mimir-wallet/utils';

import { getOwners } from '../account';
import { TypedDataTypes } from '../config';
import { generateSafeMessageMessage } from '../message';

export async function signSafeMessage(
  wallet: IWalletClient,
  client: IPublicClient,
  safeAddress: Address,
  safeMessage: SafeMessage,
  signer: Address = wallet.account.address,
  addressChain: Address[] = []
): Promise<Hex> {
  if (!addressChain || addressChain.length === 0) {
    addressChain = [signer];
  }

  const messageData = generateSafeMessageMessage(safeMessage);

  if (addressChain.length < 2) {
    return wallet.signTypedData({
      account: signer,
      domain: {
        chainId: wallet.chain.id,
        verifyingContract: safeAddress
      } as const,
      types: TypedDataTypes.safeMessage,
      primaryType: 'SafeMessage',
      message: {
        message: messageData
      }
    });
  }

  let address = safeAddress;

  for (let i = 0; i < addressChain.length; i++) {
    const owners = await getOwners(client, address);

    const _address = owners.find((item) => addressEq(item, addressChain[i]));

    if (!_address) {
      throw new Error(`${addressChain[i]} is not owner of ${address}`);
    }

    if (addressEq(_address, signer)) {
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
