// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { useContext } from 'react';

import IconWarning from '@mimir-wallet/assets/svg/icon-warning-fill.svg?react';
import { AddressContext } from '@mimir-wallet/providers';

function ReadOnlyAlert({ safeAddress }: { safeAddress: Address }) {
  const { addWatchOnlyList } = useContext(AddressContext);

  return (
    <div className='z-30 sticky top-[65px] w-full bg-colored-background sm:h-[37px] h-auto sm:px-5 px-2.5 sm:py-2.5 py-0.5 flex items-center gap-2.5 text-primary-foreground'>
      <IconWarning />
      <span>
        You are not a member of this account, currently in Watch-only mode.
        <span className='cursor-pointer hover:underline' onClick={() => addWatchOnlyList(safeAddress)}>
          {'Add to watch list>>'}
        </span>
      </span>
    </div>
  );
}

export default ReadOnlyAlert;
