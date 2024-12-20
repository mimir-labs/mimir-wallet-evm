// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Hex } from 'viem';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';

import { Chip, Divider, Link } from '@nextui-org/react';
import React, { useMemo } from 'react';

import { AppName, Empty } from '@mimir-wallet/components';
import { EmptyArray } from '@mimir-wallet/constants';
import { useCurrentChain, useParseCall, usePendingTransactions, useQueryAccount } from '@mimir-wallet/hooks';
import { approveCounts } from '@mimir-wallet/safe';
import { BaseAccount } from '@mimir-wallet/safe/types';

function Item({
  address,
  hash,
  data,
  nonce,
  website,
  iconUrl,
  appName,
  account,
  signatures
}: {
  address: Address;
  hash: Hex;
  account?: BaseAccount | null;
  signatures: SignatureResponse[];
  data?: Hex;
  website?: string;
  iconUrl?: string;
  appName?: string;
  nonce: bigint | string;
}) {
  const [, parsed] = useParseCall(data || '0x');
  const approval = useMemo(() => (account ? approveCounts(account, signatures, true) : 0), [account, signatures]);

  return (
    <Link
      href={`/transactions?address=${address}&${hash}=${hash}`}
      className='grid grid-cols-6 items-center rounded-small text-small text-foreground hover:bg-secondary p-2 [&>div]:flex [&>div]:items-center'
    >
      <div className='col-span-2'>
        <AppName website={website} iconUrl={iconUrl} appName={appName} />
      </div>
      <div className='col-span-1'>#{nonce.toString()}</div>
      <div className='col-span-2'>{parsed.functionName}</div>
      <div className='col-span-1 justify-self-end'>
        <Chip color='primary' size='sm' className='h-5'>
          {approval}/{account?.threshold || 1}
        </Chip>
      </div>
    </Link>
  );
}

function PendingTx({ address }: { address: Address }) {
  const [chainId] = useCurrentChain();
  const [{ current, queue }] = usePendingTransactions(chainId, address);
  const account = useQueryAccount(address);

  if (!current && Object.keys(queue).length === 0) {
    return <Empty height={200} label='No pending transactions' />;
  }

  return (
    <div className='space-y-2'>
      {current && (
        <React.Fragment key={`${current[0]}`}>
          <Item
            address={address}
            hash={current[1][0]?.transaction.hash}
            website={current[1][0]?.transaction.website}
            iconUrl={current[1][0]?.transaction.iconUrl}
            appName={current[1][0]?.transaction.appName}
            nonce={current[0]}
            data={current[1][0]?.transaction.data}
            account={account}
            signatures={current[1]?.[0].signatures || EmptyArray}
          />
          <Divider />
        </React.Fragment>
      )}
      {Object.entries(queue).map(([nonce, item]) => (
        <React.Fragment key={`${nonce}`}>
          <Item
            address={address}
            hash={item[0]?.transaction.hash}
            website={item[0]?.transaction.website}
            iconUrl={item[0]?.transaction.iconUrl}
            appName={item[0]?.transaction.appName}
            nonce={nonce}
            data={item[0]?.transaction.data}
            account={account}
            signatures={item[0]?.signatures || EmptyArray}
          />
          <Divider />
        </React.Fragment>
      ))}
    </div>
  );
}

export default PendingTx;
