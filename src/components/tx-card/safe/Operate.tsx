// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse, TransactionResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount, SafeTransaction } from '@mimir-wallet/safe/types';

import React from 'react';

import Alert from '@mimir-wallet/components/Alert';
import SafeTxButton from '@mimir-wallet/components/SafeTxButton';
import { useIsReadOnly } from '@mimir-wallet/hooks';
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
  transaction: SafeTransaction | TransactionResponse;
  signatures: SignatureResponse[];
  isSignatureReady: boolean;
}) {
  const isReadOnly = useIsReadOnly(account);

  return (
    <>
      {filterPaths.length === 0 && !isSignatureReady && !isReadOnly && (
        <Alert variant='text' severity='warning' size='tiny' title='Waiting for other members’ approvement.' />
      )}

      <div className='flex items-center gap-x-2.5'>
        {!hasCancelTx && !isReadOnly && (
          <SafeTxButton
            isApprove={false}
            isCancel
            metadata={{ website: `mimir://internal/cancel-tx?nonce=${transaction.nonce.toString()}` }}
            address={account.address}
            buildTx={async () => buildSafeTransaction(account.address, { value: 0n })}
            cancelNonce={transaction.nonce}
            fullWidth
            variant='bordered'
            radius='full'
            color='danger'
            withConnect
          >
            Reject
          </SafeTxButton>
        )}
        {(isSignatureReady || (!isReadOnly && filterPaths.length > 0)) && (
          <SafeTxButton
            isApprove
            isCancel={false}
            isSignatureReady={isSignatureReady}
            safeTx={transaction}
            signatures={signatures}
            address={account.address}
            metadata={{
              website: (transaction as TransactionResponse).website,
              iconUrl: (transaction as TransactionResponse).iconUrl,
              appName: (transaction as TransactionResponse).appName
            }}
            fullWidth
            radius='full'
            color='primary'
            withConnect
          >
            {isSignatureReady ? 'Execute' : 'Approve'}
          </SafeTxButton>
        )}
      </div>
    </>
  );
}

export default React.memo(Operate);
