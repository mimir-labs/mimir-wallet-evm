// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useChains } from 'wagmi';

import { CustomChain } from '@mimir-wallet/config';
import { ENABLE_EIP_3770_KEY } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks';

interface Props {
  address?: string | null | undefined;
  showFull?: boolean;
}

function Address({ showFull, address }: Props) {
  const [enableEip3770] = useLocalStore(ENABLE_EIP_3770_KEY, false);
  const [chain] = useChains();
  const shortName = (chain as CustomChain | undefined)?.shortName || '';

  return address
    ? `${enableEip3770 ? `${shortName}:` : ''}${showFull ? address : `${address.slice(0, 6)}…${address.slice(-4)}`}`
    : '0x';
}

export default React.memo(Address);
