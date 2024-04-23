// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Hex } from 'viem';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';

import { Chip, Divider, Link } from '@nextui-org/react';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';

import { AppName, Empty } from '@mimir-wallet/components';
import { approveCounts } from '@mimir-wallet/components/safe-tx-modal/utils';
import { useParseCall, usePendingTransactions, useQueryAccount, useSafeInfo } from '@mimir-wallet/hooks';
import { BaseAccount } from '@mimir-wallet/safe/types';

function Item({
  address,
  hash,
  data,
  nonce,
  website,
  account,
  signatures
}: {
  address: Address;
  hash: Hex;
  account?: BaseAccount | null;
  signatures: SignatureResponse[];
  data?: Hex;
  website?: string;
  nonce: bigint | string;
}) {
  const [, parsed] = useParseCall(data || '0x');
  const approval = useMemo(() => (account ? approveCounts(account, signatures) : 0), [account, signatures]);

  return (
    <Link
      href={`/transactions?address=${address}&${hash}=${hash}`}
      className='grid grid-cols-6 items-center rounded-small text-small text-foreground hover:bg-secondary p-2 [&>div]:flex [&>div]:items-center'
    >
      <div className='col-span-2'>
        <AppName website={website} />
      </div>
      <div className='col-span-1'>
        Nonce <span className='font-bold text-primary'>#{nonce.toString()}</span>
      </div>
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
  const chainId = useChainId();
  const info = useSafeInfo(address);
  const [{ current, queue }] = usePendingTransactions(chainId, address, info?.[0]);
  const account = useQueryAccount(address);

  if (!current && Object.keys(queue).length === 0) {
    return <Empty height={200} label='No pending transactions' />;
  }

  return (
    <div className='space-y-2'>
      {current && (
        <>
          <Item
            address={address}
            hash={current[1][0]?.transaction.hash}
            website={current[1][0]?.transaction.website}
            key={current[0].toString()}
            nonce={current[0]}
            data={current[1][0]?.transaction.data}
            account={account}
            signatures={current[1]?.[0].signatures || []}
          />
          <Divider />
        </>
      )}
      {Object.entries(queue).map(([nonce, item]) => (
        <>
          <Item
            address={address}
            hash={item[0]?.transaction.hash}
            website={item[0]?.transaction.website}
            nonce={nonce}
            key={nonce}
            data={item[0]?.transaction.data}
            account={account}
            signatures={item[0]?.signatures || []}
          />
          <Divider />
        </>
      ))}
    </div>
  );
}

export default PendingTx;
