// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query';
import { Address } from 'abitype';

import { assetsSrviceUrl } from '@mimir-wallet/config';
import { useCurrentChain } from '@mimir-wallet/hooks';

import { Nft } from './types';

export function useAccountNFTs(address?: Address) {
  const [chainId] = useCurrentChain();
  const { data, isFetched, isFetching } = useQuery<{ assets: Nft[] }>({
    initialData: {
      assets: []
    },
    queryHash: assetsSrviceUrl(`addresses/${address}/nfts?chain_id=${chainId}`),
    queryKey: [address ? assetsSrviceUrl(`addresses/${address}/nfts?chain_id=${chainId}`) : null]
  });

  return [data, isFetched, isFetching] as const;
}
