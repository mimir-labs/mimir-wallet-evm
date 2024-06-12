// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EIP155 } from './constants';

export const isPairingUri = (uri: string): boolean => {
  return uri.startsWith('wc:') && uri.length > 20;
};

export const getEip155ChainId = (chainId: string | number): string => {
  return `${EIP155}:${chainId}`;
};

export const stripEip155Prefix = (eip155Address: string): string => {
  return eip155Address.split(':').pop() ?? '';
};
