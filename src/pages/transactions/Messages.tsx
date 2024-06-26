// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount } from '@mimir-wallet/safe/types';

import React from 'react';
import { useChainId } from 'wagmi';

import { Empty, SafeMessageCard } from '@mimir-wallet/components';
import { useQueryMessages } from '@mimir-wallet/hooks';

function Messages({ account }: { account: BaseAccount }) {
  const chainId = useChainId();
  const [items, isFetched] = useQueryMessages(chainId, account.address);

  if (isFetched && items.length === 0) {
    return <Empty height='80dvh' />;
  }

  return (
    <div className='space-y-5'>
      {items.map((item, index) => (
        <SafeMessageCard key={item.message.hash} data={item} defaultOpen={index === 0} account={account} />
      ))}
    </div>
  );
}

export default React.memo(Messages);
