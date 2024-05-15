// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount, SafeAccount, SafeTransaction } from '@mimir-wallet/safe/types';

import { Accordion, AccordionItem, Progress } from '@nextui-org/react';
import React, { useMemo } from 'react';

import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import AddressCell from '@mimir-wallet/components/AddressCell';
import Alert from '@mimir-wallet/components/Alert';
import SafeTxButton from '@mimir-wallet/components/SafeTxButton';
import { SignatureResponse } from '@mimir-wallet/hooks/types';
import { approveCounts, buildSafeTransaction } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

function ProgressItem({ signature, account }: { account?: BaseAccount; signature: SignatureResponse }) {
  const _account = useMemo(
    () => (account as SafeAccount).members?.find((item) => item.address === signature.signature.signer),
    [account, signature.signature.signer]
  );
  const approveCount = useMemo(
    () => (_account ? approveCounts(_account, signature.children || []) : 0),
    [_account, signature.children]
  );

  if (account?.members?.find((item) => addressEq(item.address, signature.signature.signer))?.type !== 'safe') {
    return null;
  }

  return (
    <Progress
      className='h-[3px]'
      size='sm'
      value={approveCount}
      maxValue={_account?.type === 'safe' ? (_account as SafeAccount).threshold : 1}
      color='primary'
    />
  );
}

function Process({
  account,
  filterPaths,
  hasCancelTx,
  transaction,
  signatures,
  isSignatureReady,
  refetch
}: {
  hasCancelTx: boolean;
  account: BaseAccount;
  filterPaths: Array<Address[]>;
  transaction: SafeTransaction;
  signatures: SignatureResponse[];
  isSignatureReady: boolean;
  refetch?: () => void;
}) {
  return (
    <div className='w-[24%] rounded-medium bg-primary/[0.04] p-3 space-y-2'>
      <h6 className='text-primary font-bold text-medium'>Process</h6>
      <Accordion defaultSelectedKeys='all' className='px-0'>
        <AccordionItem
          indicator={<ArrowLeft />}
          isCompact
          classNames={{
            titleWrapper: ['py-0'],
            title: ['py-0 text-small font-bold flex justify-between'],
            content: 'p-0 pb-2 space-y-2'
          }}
          key='1'
          aria-label='Confirmations'
          title='Confirmations'
        >
          {signatures.map((sig) => (
            <div key={sig.uuid} className='rounded-medium bg-primary/5 p-[5px]'>
              <AddressCell iconSize={30} withCopy address={sig.signature.signer} />
              <div className='px-[40px]'>
                <ProgressItem signature={sig} account={account} />
              </div>
            </div>
          ))}
        </AccordionItem>
      </Accordion>

      {filterPaths.length === 0 && (
        <Alert variant='text' severity='warning' size='tiny' title='Waiting for other members’ approvement.' />
      )}

      <div className='flex items-center gap-x-2.5'>
        {!hasCancelTx && (
          <SafeTxButton
            isApprove={false}
            isCancel
            website={`mimir://internal/cancel-tx?nonce=${transaction.nonce.toString()}`}
            address={account.address}
            buildTx={async () => buildSafeTransaction(account.address, { value: 0n })}
            cancelNonce={transaction.nonce}
            onSuccess={refetch}
            fullWidth
            variant='bordered'
            radius='full'
            color='danger'
          >
            Reject
          </SafeTxButton>
        )}
        {(filterPaths.length > 0 || isSignatureReady) && (
          <SafeTxButton
            isApprove
            isCancel={false}
            isSignatureReady={isSignatureReady}
            safeTx={transaction}
            signatures={signatures}
            address={account.address}
            onSuccess={refetch}
            fullWidth
            radius='full'
            color='primary'
          >
            {isSignatureReady ? 'Execute' : 'Approve'}
          </SafeTxButton>
        )}
      </div>
    </div>
  );
}

export default React.memo(Process);
