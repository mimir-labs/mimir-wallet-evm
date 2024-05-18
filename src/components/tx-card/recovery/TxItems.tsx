// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import React from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-outlined.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { Button, ButtonEnable, SafeTxButton } from '@mimir-wallet/components';
import AppName from '@mimir-wallet/components/AppName';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
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

  const now = Date.now();

  const isExpiration = cooldown && expiration ? tx.createdAt + cooldown + expiration < now : false;

  return (
    <div className='cursor-pointer h-10 px-3 grid grid-cols-6' onClick={toggleOpen}>
      <div className='col-span-3 flex items-center'>
        <AppName website='mimir://internal/recovery' />
      </div>
      <div className='col-span-1 flex items-center'>
        <TimeCell time={tx.createdAt} />
      </div>
      <div className='col-span-1 flex items-center' />
      <div className='col-span-1 flex items-center justify-between'>
        <div className='space-x-2'>
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
                  website='mimir://internal/cancel-recovery'
                  isApprove={false}
                  isCancel={false}
                  address={tx.to}
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
