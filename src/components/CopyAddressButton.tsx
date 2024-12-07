// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from './types';

import React from 'react';

import { ENABLE_EIP_3770_KEY } from '@mimir-wallet/constants';
import { useCurrentChain, useLocalStore } from '@mimir-wallet/hooks';

import CopyButton from './CopyButton';

interface Props extends Omit<ButtonProps, 'value'> {
  address?: string | null;
  colored?: boolean;
}

function CopyAddressButton({ address, ...props }: Props) {
  const [enableEip3770] = useLocalStore(ENABLE_EIP_3770_KEY, false);
  const [, chain] = useCurrentChain();
  const shortName = chain?.shortName || '';

  return <CopyButton {...props} value={address ? `${enableEip3770 ? `${shortName}:` : ''}${address}` : '0x'} />;
}

export default React.memo(CopyAddressButton);
