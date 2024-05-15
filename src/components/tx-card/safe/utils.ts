// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';

import { signaturePaths } from '@mimir-wallet/safe';

export function findWaitApproveFilter(
  allPaths: Array<Address[]>,
  signatures: SignatureResponse[],
  address: Address
): Array<Address[]> {
  const approvePaths = signatures.map((item) => signaturePaths(item, address)).flat();

  const approvePathsStr = approvePaths.map((item) => item.join('-'));
  const waitPaths = allPaths.filter((item) => !approvePathsStr.includes(item.join('-')));

  return waitPaths;
}
