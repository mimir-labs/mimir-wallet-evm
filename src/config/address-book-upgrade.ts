// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { getAddress } from 'viem';

import {
  ADDRESS_BOOK_KEY,
  ADDRESS_BOOK_UPGRADE_VERSION_KEY,
  ADDRESS_NAMES_KEY,
  DEPRECATED_ADDRESS_BOOK_KEY
} from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

export function upgradeAddressBook() {
  const addressBookVersion = store.get(ADDRESS_BOOK_UPGRADE_VERSION_KEY);

  if (addressBookVersion === '1') {
    return;
  }

  const list = store.get(DEPRECATED_ADDRESS_BOOK_KEY) as Address[];

  if (list) {
    const newList = list.flatMap((address) =>
      [534_352, 11_155_111, 46, 44].map((chainId) => {
        const names = store.get(ADDRESS_NAMES_KEY) as Record<string, string> | undefined | null;

        return {
          address: getAddress(address),
          chainId,
          name: names ? names[address.toLowerCase()] || names[getAddress(address)] : address.slice(0, 6).toUpperCase()
        };
      })
    );

    store.set(ADDRESS_BOOK_KEY, newList);
  }

  store.set(ADDRESS_BOOK_UPGRADE_VERSION_KEY, '1');
}
