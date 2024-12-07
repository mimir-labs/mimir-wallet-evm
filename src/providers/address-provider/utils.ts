// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

import { getAddress } from 'viem';

import { service, sleep } from '@mimir-wallet/utils';

export function transformMultisig(data: Record<Address, AccountResponse[]>) {
  const multisigs: Record<Address, Multisig[]> = Object.entries(data).reduce<Record<Address, Multisig[]>>(
    (result, [address, items]) => {
      result[getAddress(address)] = items
        .filter((item) => item.type === 'safe')
        .map((account) => ({
          address: account.address,
          chainId: account.chainId,
          readonly: !!account.readonly,
          name: account.name,
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

      return result;
    },
    {}
  );

  return multisigs;
}

export async function querySync(
  address: Address,
  setMultisigs: (values: Record<Address, Multisig[]>) => void
): Promise<Record<Address, Multisig[]>> {
  return service
    .getOwnedAccountForAllChain(address)
    .then((data) => {
      const multisigs = transformMultisig(data);

      setMultisigs(multisigs);

      return multisigs;
    })
    .catch(async () => {
      await sleep(3000);

      return querySync(address, setMultisigs);
    });
}
