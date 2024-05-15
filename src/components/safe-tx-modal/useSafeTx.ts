// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { IPublicClient, IWalletClient, SafeAccount, SafeTransaction } from '@mimir-wallet/safe/types';
import type { SafeTxState, UseSafeTx } from './types';

import { useCallback, useContext, useMemo, useState } from 'react';
import { zeroAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { useMultisig, usePendingTransactions, useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import {
  approveCounts,
  buildBytesSignatures,
  execute,
  hashSafeTransaction,
  memberPaths,
  signSafeTransaction
} from '@mimir-wallet/safe';
import { service } from '@mimir-wallet/utils';

import { findWaitApproveFilter } from '../tx-card/safe/utils';
import { useSimulation } from './useSimulation';
import { buildSigTree } from './utils';

export function useSafeTx<Approve extends boolean, Cancel extends boolean>({
  signatures = [],
  isApprove,
  isCancel,
  cancelNonce,
  onClose,
  tx,
  safeTx: propsSafeTx,
  onSuccess,
  website,
  address,
  addressChain: propsAddressChain
}: UseSafeTx<Approve, Cancel>): SafeTxState {
  const chainId = useChainId();
  const { isSigner } = useContext(AddressContext);
  const [addressChain, setAddressChain] = useState<Address[]>(propsAddressChain || []);
  const [customNonce, setCustomNonce] = useState<bigint>();
  const multisig = useMultisig(address);
  const [{ current, queue }] = usePendingTransactions(chainId, address);
  const account = useQueryAccount(address);
  const { address: signer } = useAccount();
  const simulation = useSimulation(tx, address);
  const safeTx: SafeTransaction | undefined = useMemo(
    (): SafeTransaction | undefined =>
      isApprove
        ? propsSafeTx
        : isCancel
          ? {
              ...tx,
              safeTxGas: 0n,
              baseGas: 0n,
              gasPrice: 0n,
              gasToken: zeroAddress,
              refundReceiver: zeroAddress,
              nonce: cancelNonce as bigint
            }
          : customNonce !== undefined
            ? {
                ...tx,
                safeTxGas: 0n,
                baseGas: 0n,
                gasPrice: 0n,
                gasToken: zeroAddress,
                refundReceiver: zeroAddress,
                nonce: customNonce
              }
            : undefined,
    [cancelNonce, customNonce, isApprove, isCancel, propsSafeTx, tx]
  );

  const allPaths = useMemo(() => (account && signer ? memberPaths(account, signer) : []), [account, signer]);
  const filterPaths = useMemo(
    () => (signer ? findWaitApproveFilter(allPaths, signatures, signer) : []),
    [signer, allPaths, signatures]
  );

  const handleSign = useCallback(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (!safeTx) return;
      const signer = addressChain[addressChain.length - 1];

      if (!signer && !isSigner(addressChain[addressChain.length - 1])) return;

      const signature = await signSafeTransaction(wallet, client, address, safeTx, signer, addressChain);

      await service.createTx(wallet.chain.id, address, signature, signer, safeTx, addressChain, website);
      onSuccess?.();
    },
    [addressChain, isSigner, address, onSuccess, safeTx, website]
  );
  const handleExecute = useCallback(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (!safeTx) return;

      await execute(wallet, client, address, safeTx, buildBytesSignatures(buildSigTree(signatures)));
      onSuccess?.();
    },
    [address, onSuccess, safeTx, signatures]
  );

  const hasSameTx = useMemo(() => {
    if (!safeTx) return false;

    const hash = hashSafeTransaction(chainId, address, safeTx);

    return (
      (current ? [current[1]] : [])
        .concat(...Object.values(queue))
        .flat()
        .findIndex((item) => item.transaction.hash === hash) > -1
    );
  }, [address, chainId, current, queue, safeTx]);

  return useMemo(
    () => ({
      isApprove,
      isCancel,
      hasSameTx,
      onClose,
      signatures,
      handleSign,
      handleExecute,
      multisig,
      address,
      filterPaths,
      tx,
      safeTx,
      setCustomNonce,
      addressChain,
      simulation,
      setAddressChain,
      isSignatureReady: account ? approveCounts(account, signatures) >= (account as SafeAccount).threshold : false
    }),
    [
      isApprove,
      isCancel,
      hasSameTx,
      onClose,
      signatures,
      handleSign,
      handleExecute,
      filterPaths,
      multisig,
      address,
      tx,
      safeTx,
      addressChain,
      simulation,
      account
    ]
  );
}
