// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount, IPublicClient, IWalletClient, SafeAccount } from '@mimir-wallet/safe/types';

import { Accordion, AccordionItem, Progress } from '@nextui-org/react';
import React, { useMemo } from 'react';

import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import AddressCell from '@mimir-wallet/components/AddressCell';
import ButtonEnable from '@mimir-wallet/components/ButtonEnable';
import { approveCounts } from '@mimir-wallet/components/safe-tx-modal/utils';
import { SignatureResponse } from '@mimir-wallet/hooks/types';
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
  signatures,
  account,
  handleApprove
}: {
  account: BaseAccount;
  signatures: SignatureResponse[];
  handleApprove?: (wallet: IWalletClient, client: IPublicClient) => void;
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
      <ButtonEnable fullWidth radius='full' color='primary' onClick={handleApprove}>
        Approve
      </ButtonEnable>
    </div>
  );
}

export default React.memo(Process);