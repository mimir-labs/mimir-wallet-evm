// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient, SafeAccount, SafeTransaction } from '@mimir-wallet/safe/types';

import { useContext, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildBytesSignatures, execute, signSafeTransaction } from '@mimir-wallet/safe';
import { service } from '@mimir-wallet/utils';

import { toastError } from '../ToastRoot';
import { approveCounts, buildSigTree } from './utils';

export interface UseSafeTx<Approve extends boolean> {
  isApprove: Approve;
  safeTx: Approve extends true ? SafeTransaction : Omit<SafeTransaction, 'nonce'> & { nonce?: bigint };
  address: Address;
  signatures?: SignatureResponse[];
  website?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useSafeTx<Approve extends boolean>({
  signatures = [],
  isApprove,
  onClose,
  safeTx,
  onSuccess,
  website,
  address
}: UseSafeTx<Approve>) {
  const { isSigner } = useContext(AddressContext);
  const [addressChain, setAddressChain] = useState<Address[]>([]);
  const [customNonce, setCustomNonce] = useState<bigint>();
  const nonce = isApprove ? safeTx.nonce : customNonce;
  const [{ loading }, handleClick] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (nonce === undefined) return;
      const signer = addressChain[addressChain.length - 1];

      if (!signer && !isSigner(addressChain[addressChain.length - 1])) return;

      await signSafeTransaction(wallet, client, address, { ...safeTx, nonce }, signer, addressChain)
        .then((signature) =>
          service.createTx(wallet.chain.id, address, signature, signer, { ...safeTx, nonce }, addressChain, website)
        )
        .then(() => onSuccess?.())
        .catch(toastError);
    },
    [addressChain, isSigner, address, nonce, onSuccess, safeTx, website]
  );
  const [{ loading: executeLoading }, handleExecute] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (nonce === undefined) return;

      try {
        await execute(wallet, client, address, { ...safeTx, nonce }, buildBytesSignatures(buildSigTree(signatures)));
        onSuccess?.();
      } catch (error) {
        toastError(error);
      }
    },
    [address, nonce, onSuccess, safeTx, signatures]
  );
  const account = useQueryAccount(address);

  return useMemo(
    () => ({
      onClose,
      loading,
      executeLoading,
      handleClick,
      handleExecute,
      address,
      safeTx,
      setCustomNonce,
      nonce,
      addressChain,
      setAddressChain,
      isSignatureReady: account ? approveCounts(account, signatures) >= (account as SafeAccount).threshold : false
    }),
    [
      onClose,
      address,
      safeTx,
      loading,
      executeLoading,
      handleClick,
      handleExecute,
      nonce,
      addressChain,
      account,
      signatures
    ]
  );
}
