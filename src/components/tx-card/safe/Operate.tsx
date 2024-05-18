// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount, SafeTransaction } from '@mimir-wallet/safe/types';

import React from 'react';

import Alert from '@mimir-wallet/components/Alert';
import SafeTxButton from '@mimir-wallet/components/SafeTxButton';
import { SignatureResponse } from '@mimir-wallet/hooks/types';
import { buildSafeTransaction } from '@mimir-wallet/safe';

function Operate({
  account,
  filterPaths,
  hasCancelTx,
  transaction,
  signatures,
  isSignatureReady
}: {
  hasCancelTx: boolean;
  account: BaseAccount;
  filterPaths: Array<Address[]>;
  transaction: SafeTransaction;
  signatures: SignatureResponse[];
  isSignatureReady: boolean;
}) {
  return (
    <>
      {filterPaths.length === 0 && !isSignatureReady && !account.isReadOnly && (
        <Alert variant='text' severity='warning' size='tiny' title='Waiting for other members’ approvement.' />
      )}

      <div className='flex items-center gap-x-2.5'>
        {!hasCancelTx && !account.isReadOnly && (
          <SafeTxButton
            isApprove={false}
            isCancel
            website={`mimir://internal/cancel-tx?nonce=${transaction.nonce.toString()}`}
            address={account.address}
            buildTx={async () => buildSafeTransaction(account.address, { value: 0n })}
            cancelNonce={transaction.nonce}
            fullWidth
            variant='bordered'
            radius='full'
            color='danger'
          >
            Reject
          </SafeTxButton>
        )}
        {!account.isReadOnly && (filterPaths.length > 0 || isSignatureReady) && (
          <SafeTxButton
            isApprove
            isCancel={false}
            isSignatureReady={isSignatureReady}
            safeTx={transaction}
            signatures={signatures}
            address={account.address}
            fullWidth
            radius='full'
            color='primary'
          >
            {isSignatureReady ? 'Execute' : 'Approve'}
          </SafeTxButton>
        )}
      </div>
    </>
  );
}

export default React.memo(Operate);
