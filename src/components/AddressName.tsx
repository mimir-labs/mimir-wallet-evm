// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useAddressName } from '@mimir-wallet/hooks';

interface Props {
  address?: string | null | undefined;
  disableEns?: boolean;
  fallback?: React.ReactNode;
}

function AddressName({ fallback, disableEns, address }: Props) {
  const name = useAddressName(address, disableEns, fallback);

  return name;
}

export default React.memo(AddressName);
