// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/features/delay/types';
import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import React from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-outlined.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { Button, ButtonEnable, SafeTxButton } from '@mimir-wallet/components';
import AppName from '@mimir-wallet/components/AppName';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useMediaQuery } from '@mimir-wallet/hooks';
import { buildSafeTransaction } from '@mimir-wallet/safe';
import { formatAgo } from '@mimir-wallet/utils';

interface Props {
  isOpen: boolean;
  tx: RecoveryTx;
  cooldown?: number;
  expiration?: number;
  toggleOpen: (value?: unknown) => void;
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => void;
  refetch?: () => void;
}

function TimeCell({ time }: { time?: number }) {
  const now = Date.now();

  time ??= now;

  return now - Number(time) < ONE_MINUTE
    ? 'Now'
    : now - Number(time) < ONE_HOUR * 1000
      ? `${formatAgo(Number(time), 'm')} mins ago`
      : now - Number(time) < ONE_DAY * 1000
        ? `${formatAgo(Number(time), 'H')} hours ago`
        : `${formatAgo(Number(time), 'D')} days ago`;
}

function TxItems({ isOpen, cooldown, expiration, tx, handleExecute, toggleOpen, refetch }: Props) {
  const { isConnected } = useAccount();
  const maxValue = tx.createdAt + (cooldown || 0);
  const upSm = useMediaQuery('sm');

  const now = Date.now();

  const { data } = useReadContract({
    abi: abis.Delay,
    address: tx.address,
    functionName: 'avatar'
  });
  const isExpiration = cooldown && expiration ? tx.createdAt + cooldown + expiration < now : false;

  return (
    <div className='cursor-pointer h-10 px-3 grid sm:grid-cols-6 grid-cols-7' onClick={toggleOpen}>
      <div className='sm:col-span-3 col-span-4 flex items-center'>
        <AppName website='mimir://internal/recovery' />
      </div>
      <div className='sm:col-span-1 col-span-2 flex items-center'>
        <TimeCell time={tx.createdAt} />
      </div>
      <div className='col-span-1 sm:flex hidden items-center' />
      <div className='col-auto flex items-center justify-between'>
        {upSm ? (
          <div className='space-x-2 flex items-center'>
            {isConnected ? (
              isExpiration ? (
                <span className='font-bold text-tiny text-danger'>Expired</span>
              ) : (
                <>
                  {cooldown && now > maxValue && (
                    <ButtonEnable
                      onClick={handleExecute}
                      isToastError
                      size='tiny'
                      radius='full'
                      variant='light'
                      isIconOnly
                      color='success'
                    >
                      <IconSuccess />
                    </ButtonEnable>
                  )}
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
                    size='tiny'
                    radius='full'
                    variant='light'
                    isIconOnly
                    color='danger'
                  >
                    <IconFail />
                  </SafeTxButton>
                </>
              )
            ) : null}
          </div>
        ) : (
          <div />
        )}
        <Button
          data-open={isOpen}
          onClick={toggleOpen}
          size='tiny'
          radius='full'
          variant='light'
          isIconOnly
          className='justify-self-end data-[open=true]:rotate-180'
          color='primary'
        >
          <ArrowDown />
        </Button>
      </div>
    </div>
  );
}

export default React.memo(TxItems);
