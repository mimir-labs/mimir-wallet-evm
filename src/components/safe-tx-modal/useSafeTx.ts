// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient, SafeAccount, SafeTransaction } from '@mimir-wallet/safe/types';

import { useCallback, useContext, useMemo, useState } from 'react';

import { useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildBytesSignatures, execute, signSafeTransaction } from '@mimir-wallet/safe';
import { service } from '@mimir-wallet/utils';

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
  const handleSign = useCallback(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (nonce === undefined) return;
      const signer = addressChain[addressChain.length - 1];

      if (!signer && !isSigner(addressChain[addressChain.length - 1])) return;

      const signature = await signSafeTransaction(wallet, client, address, { ...safeTx, nonce }, signer, addressChain);

      await service.createTx(wallet.chain.id, address, signature, signer, { ...safeTx, nonce }, addressChain, website);
      onSuccess?.();
    },
    [addressChain, isSigner, address, nonce, onSuccess, safeTx, website]
  );
  const handleExecute = useCallback(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (nonce === undefined) return;

      await execute(wallet, client, address, { ...safeTx, nonce }, buildBytesSignatures(buildSigTree(signatures)));
      onSuccess?.();
    },
    [address, nonce, onSuccess, safeTx, signatures]
  );
  const account = useQueryAccount(address);

  return useMemo(
    () => ({
      onClose,
      handleSign,
      handleExecute,
      address,
      safeTx,
      setCustomNonce,
      nonce,
      addressChain,
      setAddressChain,
      isSignatureReady: account ? approveCounts(account, signatures) >= (account as SafeAccount).threshold : false
    }),
    [onClose, handleSign, handleExecute, address, safeTx, nonce, addressChain, account, signatures]
  );
}
