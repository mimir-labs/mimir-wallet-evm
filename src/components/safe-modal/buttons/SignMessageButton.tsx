// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Hex } from 'viem';
import type { BaseAccount, IPublicClient, IWalletClient, SafeMessage } from '@mimir-wallet/safe/types';

import React from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import ButtonEnable from '@mimir-wallet/components/ButtonEnable';
import { toastSuccess } from '@mimir-wallet/components/ToastRoot';
import { useIsReadOnly } from '@mimir-wallet/hooks';
import { signSafeMessage } from '@mimir-wallet/safe';
import { addressEq, service } from '@mimir-wallet/utils';

function SignMessageButton({
  safeAccount,
  safeAddress,
  message,
  addressChain,
  filterPaths,
  website,
  iconUrl,
  appName,
  onSuccess
}: {
  safeAccount?: BaseAccount | null;
  safeAddress: Address;
  message: SafeMessage;
  addressChain: Address[];
  filterPaths: Address[][];
  website?: string | undefined;
  iconUrl?: string | undefined;
  appName?: string | undefined;
  onSuccess?: (signature: Hex) => void;
}) {
  const { address: walletAddress } = useAccount();
  const isReadOnly = useIsReadOnly(safeAccount);
  const [state, handleSign] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient) => {
      return signSafeMessage(wallet, client, safeAddress, message, wallet.account.address, addressChain)
        .then(async (signature) => {
          await service.createMessage(
            wallet.chain.id,
            safeAddress,
            signature,
            wallet.account.address,
            message,
            addressChain,
            website,
            iconUrl,
            appName
          );

          return signature;
        })
        .then((signature) => {
          onSuccess?.(signature);
          toastSuccess('Sign Success!');
        });
    },
    [addressChain, appName, iconUrl, message, onSuccess, safeAddress, website]
  );

  return (
    <ButtonEnable
      isToastError
      onClick={handleSign}
      color='primary'
      fullWidth
      radius='full'
      disabled={
        isReadOnly || filterPaths.length === 0 || !addressEq(walletAddress, addressChain[addressChain.length - 1])
      }
      isLoading={state.loading}
      withConnect
    >
      Sign
    </ButtonEnable>
  );
}

export default React.memo(SignMessageButton);
