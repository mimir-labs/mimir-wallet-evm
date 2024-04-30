// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount, IPublicClient, IWalletClient, SafeTransaction } from '@mimir-wallet/safe/types';

import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import dayjs from 'dayjs';
import React from 'react';

import { Alert } from '@mimir-wallet/components';
import { type SignatureResponse, type TransactionResponse } from '@mimir-wallet/hooks/types';

import Cell from './Cell';

interface Props {
  account?: BaseAccount | null;
  defaultOpen?: boolean;
  nonce: bigint;
  data: { transaction: TransactionResponse; signatures: SignatureResponse[] }[];
  hiddenConflictWarning?: boolean;
  handleApprove?: (
    wallet: IWalletClient,
    client: IPublicClient,
    safeTx: SafeTransaction,
    signatures: SignatureResponse[]
  ) => void;
}

function SafeTxCard({ account, hiddenConflictWarning, defaultOpen, handleApprove, data, nonce }: Props) {
  const time = data.at(0)?.transaction.createdAt;

  return (
    <Card>
      <CardHeader className='flex-col items-start gap-y-2'>
        <div className='w-full flex items-center justify-between'>
          <h4 className='text-primary font-bold text-xl'># {nonce.toString()}</h4>
          <span className='text-small'>{dayjs(time).format()}</span>
        </div>
        {!hiddenConflictWarning && data.length > 1 && (
          <Alert
            size='tiny'
            title={
              <div>
                Conflicting transactions. Executing one will automatically replace the others. Why did this happen?
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
              handleApprove={handleApprove}
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
