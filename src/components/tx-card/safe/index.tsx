// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionSignature } from '@mimir-wallet/hooks';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Card, CardBody, CardHeader, Divider, Link } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { size } from 'viem';
import { useAccount } from 'wagmi';

import { Alert } from '@mimir-wallet/components';
import { memberPaths } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import Cell from './Cell';

interface Props {
  account?: BaseAccount | null;
  defaultOpen?: boolean;
  nonce: bigint;
  data: TransactionSignature[];
  hiddenConflictWarning?: boolean;
}

function SafeTxCard({ account, hiddenConflictWarning, defaultOpen, data, nonce }: Props) {
  const { address } = useAccount();
  const hasCancelTx = useMemo(
    () =>
      data.findIndex(
        (item) =>
          size(item.transaction.data) === 0 &&
          item.transaction.value === 0n &&
          addressEq(item.transaction.to, item.transaction.address)
      ) > -1,
    [data]
  );

  const allPaths = useMemo(() => (account && address ? memberPaths(account, address) : []), [account, address]);

  return (
    <Card>
      <CardHeader className='flex-col items-start gap-y-2'>
        <div className='w-full flex items-center justify-between'>
          <h4 className='text-primary font-bold text-xl'># {nonce.toString()}</h4>
        </div>

        {!hiddenConflictWarning && data.length > 1 && (
          <Alert
            size='tiny'
            title={
              <div>
                Conflicting transactions. Executing one will automatically replace the others.{' '}
                <Link
                  href='https://help.safe.global/en/articles/40839-why-are-transactions-with-the-same-nonce-conflicting-with-each-other'
                  isExternal
                  className='text-tiny'
                >
                  Why did this happen?
                </Link>
              </div>
            }
            severity='error'
          />
        )}
      </CardHeader>

      <Divider className='mx-3 w-auto' />

      {account ? (
        <CardBody className='space-y-3'>
          {data.map((item) => (
            <Cell
              account={account}
              allPaths={allPaths}
              hasCancelTx={hasCancelTx}
              key={item.transaction.hash}
              defaultOpen={defaultOpen}
              transaction={item.transaction}
              signatures={item.signatures}
            />
          ))}
        </CardBody>
      ) : null}
    </Card>
  );
}

export default React.memo(SafeTxCard);
