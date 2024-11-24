// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/features/delay/types';
import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Accordion, AccordionItem } from '@nextui-org/react';
import React from 'react';
import { encodeFunctionData } from 'viem';
import { useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import ArrowLeft from '@mimir-wallet/assets/svg/ArrowLeft.svg?react';
import AddressCell from '@mimir-wallet/components/AddressCell';
import Alert from '@mimir-wallet/components/Alert';
import ButtonEnable from '@mimir-wallet/components/ButtonEnable';
import SafeTxButton from '@mimir-wallet/components/SafeTxButton';
import { buildSafeTransaction } from '@mimir-wallet/safe';

function Process({
  cooldown,
  expiration,
  tx,
  handleExecute,
  refetch
}: {
  cooldown?: number;
  expiration?: number;
  tx: RecoveryTx;
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => void;
  refetch?: () => void;
}) {
  const now = Date.now();

  const { data } = useReadContract({
    abi: abis.Delay,
    address: tx.address,
    functionName: 'avatar'
  });

  return (
    <div className='sm:w-[24%] w-full rounded-medium sm:bg-primary/[0.04] bg-transparent sm:p-3 p-0 space-y-2'>
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
          aria-label='Recoverer'
          title='Recoverer'
        >
          <div className='rounded-medium bg-primary/5 p-[5px]'>
            <AddressCell iconSize={30} withCopy address={tx.sender} />
          </div>
        </AccordionItem>
      </Accordion>
      {cooldown && expiration && now > tx.createdAt + cooldown + expiration && (
        <Alert severity='error' title='This recovery expired, please cancel it' />
      )}
      <div className='flex items-center gap-x-4'>
        <SafeTxButton
          metadata={{ website: 'mimir://internal/cancel-recovery' }}
          isApprove={false}
          isCancel={false}
          address={data}
          buildTx={async () =>
            buildSafeTransaction(tx.address, {
              value: 0n,
              data: encodeFunctionData({
                abi: abis.Delay,
                functionName: 'setTxNonce',
                args: [tx.queueNonce + 1n]
              })
            })
          }
          onSuccess={refetch}
          fullWidth
          radius='full'
          color='danger'
          variant='bordered'
          withConnect
        >
          Cancel
        </SafeTxButton>
        {cooldown && now > tx.createdAt + cooldown && (
          <ButtonEnable
            isToastError
            onClick={handleExecute}
            fullWidth
            radius='full'
            color='primary'
            disabled={!!cooldown && !!expiration && now > tx.createdAt + cooldown + expiration}
            withConnect
          >
            Execute
          </ButtonEnable>
        )}
      </div>
    </div>
  );
}

export default React.memo(Process);
