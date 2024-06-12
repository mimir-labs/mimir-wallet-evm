// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import React from 'react';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressRow, SafeTxButton } from '@mimir-wallet/components';
import { buildDeleteSafeModule } from '@mimir-wallet/safe';

function ModuleItem({ safeAddress, moduleAddress }: { safeAddress: Address; moduleAddress: Address }) {
  return (
    <div className='flex items-center justify-between text-small'>
      <AddressRow iconSize={30} withCopy withExplorer address={moduleAddress} />
      <SafeTxButton
        isApprove={false}
        isCancel={false}
        address={safeAddress}
        metadata={{ website: 'mimir://internal/setup' }}
        buildTx={(_, client) => buildDeleteSafeModule(client, safeAddress, moduleAddress)}
        color='danger'
        size='tiny'
        variant='light'
        isIconOnly
      >
        <IconDelete />
      </SafeTxButton>
    </div>
  );
}

export default React.memo(ModuleItem);
