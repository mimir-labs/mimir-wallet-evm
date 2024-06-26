// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SafeAccount } from '@mimir-wallet/safe/types';
import type { SafeMessageState, UseSafeMessage } from '../types';

import { useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { useMultisig, useQueryAccount, useQueryMessage } from '@mimir-wallet/hooks';
import { approveCounts, buildBytesSignatures, memberPaths } from '@mimir-wallet/safe';
import { generateSafeMessageMessage, hashSafeMessage } from '@mimir-wallet/safe/message';

import { findWaitApproveFilter } from '../../tx-card/safe/utils';
import { buildSigTree, findValidSignature, nextApproveCounts } from '../utils';

export function useSafeMessage({
  message,
  address,
  addressChain: propsAddressChain
}: UseSafeMessage): SafeMessageState {
  const chainId = useChainId();
  const [addressChain, setAddressChain] = useState<Address[]>(propsAddressChain || []);
  const multisig = useMultisig(address);
  const safeAccount = useQueryAccount(address);
  const { address: signer } = useAccount();
  const msgHash = useMemo(() => hashSafeMessage(chainId, address, message), [address, chainId, message]);
  const safeMessage = useMemo(() => generateSafeMessageMessage(message), [message]);
  const [messageSignature, isFetched, isFetching, refetch] = useQueryMessage(chainId, msgHash);

  const allPaths = useMemo(
    () => (safeAccount && signer ? memberPaths(safeAccount, signer) : []),
    [safeAccount, signer]
  );
  const filterPaths = useMemo(
    () => (signer ? findWaitApproveFilter(allPaths, messageSignature?.signatures || [], signer) : []),
    [signer, messageSignature, allPaths]
  );

  const isSignatureReady = useMemo(
    () =>
      safeAccount && messageSignature
        ? approveCounts(safeAccount, messageSignature.signatures, true) >= (safeAccount as SafeAccount).threshold
        : false,
    [safeAccount, messageSignature]
  );
  const isNextSignatureReady = useMemo(
    () =>
      safeAccount && messageSignature && addressChain.length > 0
        ? nextApproveCounts(safeAccount, messageSignature.signatures, addressChain) >=
          (safeAccount as SafeAccount).threshold
        : false,
    [safeAccount, addressChain, messageSignature]
  );
  const finalSignature = useMemo(
    () =>
      safeAccount && isSignatureReady && messageSignature
        ? buildBytesSignatures(buildSigTree(safeAccount, findValidSignature(safeAccount, messageSignature.signatures)))
        : undefined,
    [isSignatureReady, messageSignature, safeAccount]
  );

  return useMemo(
    () => ({
      hash: msgHash,
      safeMessage,
      messageSignature,
      safeAccount,
      multisig,
      filterPaths,
      addressChain,
      setAddressChain,
      isSignatureReady,
      isNextSignatureReady,
      finalSignature,
      isFetched,
      isFetching,
      refetch
    }),
    [
      addressChain,
      filterPaths,
      finalSignature,
      isFetched,
      isFetching,
      isNextSignatureReady,
      isSignatureReady,
      messageSignature,
      msgHash,
      multisig,
      refetch,
      safeAccount,
      safeMessage
    ]
  );
}
