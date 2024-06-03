// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient, SafeAccount, SafeTransaction } from '@mimir-wallet/safe/types';
import type { SafeTxState, UseSafeTx } from './types';

import { useCallback, useContext, useMemo, useState } from 'react';
import { padHex, zeroAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { PENDING_SAFE_TX_PREFIX } from '@mimir-wallet/constants';
import { useMultisig, usePendingTransactions, useQueryAccount, useSafeNonce } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import {
  approveCounts,
  buildBytesSignatures,
  execute,
  hashSafeTransaction,
  memberPaths,
  signSafeTransaction
} from '@mimir-wallet/safe';
import { addressEq, service, session } from '@mimir-wallet/utils';

import { findWaitApproveFilter } from '../tx-card/safe/utils';
import { useSimulation } from './useSimulation';
import { buildSigTree, findValidSignature, nextApproveCounts } from './utils';

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
  const [{ current, queue }, , , refetch] = usePendingTransactions(chainId, address);
  const account = useQueryAccount(address);
  const { address: signer } = useAccount();
  const [onChainNonce] = useSafeNonce(address);
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
      refetch();
      onSuccess?.(safeTx);
    },
    [safeTx, addressChain, isSigner, address, website, refetch, onSuccess]
  );
  const handleExecute = useCallback(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (!safeTx || !account) return;

      const hash = await execute(
        wallet,
        client,
        address,
        safeTx,
        buildBytesSignatures(buildSigTree(findValidSignature(account, signatures)))
      );

      await client.waitForTransactionReceipt({ hash });

      session.set(`${PENDING_SAFE_TX_PREFIX}${chainId}:${address}:${safeTx.nonce}`, true);
      refetch();
      onSuccess?.(safeTx);
    },
    [account, address, chainId, onSuccess, refetch, safeTx, signatures]
  );
  const handleSignAndExecute = useCallback(
    async (wallet: IWalletClient, client: IPublicClient): Promise<void> => {
      if (!safeTx || !account) return;

      const signer = addressChain[addressChain.length - 1];

      if (!signer && !isSigner(addressChain[addressChain.length - 1])) return;

      const signature = await signSafeTransaction(wallet, client, address, safeTx, signer, addressChain);

      await service.createTx(wallet.chain.id, address, signature, signer, safeTx, addressChain, website);

      const _signatures = JSON.parse(JSON.stringify(signatures));
      let mapSigs: SignatureResponse[] = _signatures;

      for (let i = 0; i < addressChain.length; i++) {
        const address = addressChain[i];

        let sub = mapSigs.find((item) => addressEq(address, item.signature.signer));

        if (!sub) {
          sub = {
            uuid: '',
            isStart: i === addressChain.length - 1,
            createdAt: Date.now(),
            signature: {
              signer: address,
              signature:
                i === addressChain.length - 1
                  ? signature
                  : padHex(padHex(address, { dir: 'left', size: 32 }), { dir: 'right', size: 65 })
            },
            children: []
          };
          mapSigs.push(sub);
        }

        if (!sub.children) {
          sub.children = [];
        }

        mapSigs = sub.children;
      }

      const hash = await execute(
        wallet,
        client,
        address,
        safeTx,
        buildBytesSignatures(buildSigTree(findValidSignature(account, _signatures)))
      );

      await client.waitForTransactionReceipt({ hash });

      session.set(`${PENDING_SAFE_TX_PREFIX}${chainId}:${address}:${safeTx.nonce}`, true);
      refetch();
      onSuccess?.(safeTx);
    },
    [account, address, addressChain, chainId, isSigner, onSuccess, refetch, safeTx, signatures, website]
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
      handleSignAndExecute,
      multisig,
      address,
      filterPaths,
      tx,
      safeTx,
      setCustomNonce,
      addressChain,
      simulation,
      setAddressChain,
      executable: onChainNonce === safeTx?.nonce,
      isSignatureReady: account ? approveCounts(account, signatures) >= (account as SafeAccount).threshold : false,
      isNextSignatureReady:
        account && addressChain.length > 0
          ? nextApproveCounts(account, signatures, addressChain) >= (account as SafeAccount).threshold
          : false
    }),
    [
      isApprove,
      isCancel,
      hasSameTx,
      onClose,
      signatures,
      handleSign,
      handleExecute,
      handleSignAndExecute,
      multisig,
      address,
      filterPaths,
      tx,
      safeTx,
      addressChain,
      simulation,
      onChainNonce,
      account
    ]
  );
}
