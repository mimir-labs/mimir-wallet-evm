// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useAddressName, useCurrentChain } from '@mimir-wallet/hooks';

interface Props {
  chainId?: number;
  address?: string | null | undefined;
  disableEns?: boolean;
  fallback?: React.ReactNode;
}

function AddressName({ chainId: propsChainId, fallback, disableEns, address }: Props) {
  const [chainId] = useCurrentChain();
  const name = useAddressName(propsChainId ?? chainId, address, disableEns, fallback);

  return name;
}

export default React.memo(AddressName);
