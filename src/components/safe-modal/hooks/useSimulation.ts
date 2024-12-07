// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { AssetChange, Simulation } from '../types';

import { useEffect, useMemo, useState } from 'react';
import { usePublicClient } from 'wagmi';

import { useCurrentChain } from '@mimir-wallet/hooks';
import { simulate } from '@mimir-wallet/safe';
import { MetaTransaction } from '@mimir-wallet/safe/types';

export function useSimulation(safeTx: MetaTransaction, address: Address): Simulation {
  const [chainId] = useCurrentChain();
  const [isPending, setPending] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isError, setError] = useState(false);
  const [isIdle, setIdle] = useState(true);
  const [assetChange, setAssetChange] = useState<AssetChange[]>([]);
  const client = usePublicClient({ chainId });

  useEffect(() => {
    if (client) {
      setIdle(false);
      setPending(true);
      simulate(
        client,
        {
          to: safeTx.to,
          value: safeTx.value,
          data: safeTx.data,
          operation: safeTx.operation
        },
        address
      )
        .then((result) => {
          if (!result.success) {
            throw new Error('Failed');
          }

          setSuccess(true);

          setAssetChange(result.assetChanges);
        })
        .catch((error) => {
          console.error(error);
          setError(true);
        })
        .finally(() => setPending(false));
    }
  }, [address, client, safeTx.data, safeTx.operation, safeTx.to, safeTx.value]);

  return useMemo(
    () => ({
      assetChange,
      isError,
      isSuccess,
      isPending,
      isIdle
    }),
    [assetChange, isError, isIdle, isPending, isSuccess]
  );
}
