// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar } from '@nextui-org/react';
import { Address } from 'abitype';
import React from 'react';
import { zeroAddress } from 'viem';
import { useChainId } from 'wagmi';

function TokenIcon({
  chainId,
  address = zeroAddress,
  size = 20
}: {
  size?: number;
  chainId?: number;
  address?: Address;
}) {
  const _chainId = useChainId();

  return <Avatar size='sm' src={`/tokens/${chainId ?? _chainId}/${address}`} style={{ width: size, height: size }} />;
}

export default React.memo(TokenIcon);
