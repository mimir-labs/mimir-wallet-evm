// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { service, sleep } from '@mimir-wallet/utils';

export async function querySync(
  chainId: number,
  address: Address,
  setMultisigs: (values: Multisig[]) => void
): Promise<Multisig[]> {
  return service
    .getOwnedAccount(chainId, address)
    .then((data) => {
      const multisigs: Multisig[] = data
        .filter((item) => item.type === 'safe')
        .map((account) => ({
          name: account.name,
          address: account.address,
          isMimir: account.isMimir,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
          members: account.members!,
          threshold: account.threshold!,
          singleton: account.singleton!,
          factory: account.factory!,
          version: account.version!,
          block: account.block!,
          transaction: account.transaction!,
          updateBlock: account.updateBlock,
          updateTransaction: account.updateTransaction
        }));

      setMultisigs(multisigs);

      return multisigs;
    })
    .catch(async () => {
      await sleep(3000);

      return querySync(chainId, address, setMultisigs);
    });
}
