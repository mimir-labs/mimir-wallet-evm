// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { CURRENT_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { service, sleep } from '@mimir-wallet/utils';

export function initCurrent(chainId: number, multisigs: Multisig[]): Address | undefined {
  const search = new URLSearchParams(window.location.search);
  const searchItem = search.get('address') as Address;
  const item = localStorage.getItem(`${CURRENT_ACCOUNT_KEY}:${chainId}`);

  let local: Address;

  if (searchItem) {
    local = searchItem;
  } else if (item) {
    local = JSON.parse(item);
  } else {
    local = multisigs[0].address;
  }

  localStorage.setItem(`${CURRENT_ACCOUNT_KEY}:${chainId}`, JSON.stringify(local));

  return local;
}

export async function querySync(
  chainId: number,
  address: Address,
  setMultisigs: (values: Multisig[]) => void,
  setCurrent: (address: Address) => void
) {
  return service
    .getOwnedAccount(chainId, address)
    .then((data) => {
      if (data.length === 0) return;

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

      const local = initCurrent(chainId, multisigs);

      if (local) setCurrent(local);
      setMultisigs(multisigs);
    })
    .catch(async () => {
      await sleep(3000);

      await querySync(chainId, address, setMultisigs, setCurrent);
    });
}
