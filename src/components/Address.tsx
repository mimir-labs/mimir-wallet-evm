// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { CustomChain } from '@mimir-wallet/config';
import { ENABLE_EIP_3770_KEY } from '@mimir-wallet/constants';
import { useChain, useCurrentChain, useLocalStore } from '@mimir-wallet/hooks';

interface Props {
  chainId?: number;
  address?: string | null | undefined;
  showFull?: boolean;
  disableEip3770?: boolean;
}

function Address({ chainId: propsChainId, disableEip3770, showFull, address }: Props) {
  const [chainId] = useCurrentChain();
  const [enableEip3770] = useLocalStore(ENABLE_EIP_3770_KEY, false);
  const chain = useChain(propsChainId ?? chainId);
  const shortName = (chain as CustomChain | undefined)?.shortName || '';

  return address
    ? `${enableEip3770 && !disableEip3770 ? `${shortName}:` : ''}${showFull ? address : `${address.slice(0, 6)}…${address.slice(-4)}`}`
    : '0x';
}

export default React.memo(Address);
