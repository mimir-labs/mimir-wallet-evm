// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, IWalletClient, MetaTransaction } from '@mimir-wallet/safe/types';

import { Chip } from '@nextui-org/react';
import React from 'react';
import { useAccount } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-outlined.svg?react';
import IconMember from '@mimir-wallet/assets/svg/icon-member.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { Button, ButtonEnable, CallDetails, FormatBalance } from '@mimir-wallet/components';
import AppName from '@mimir-wallet/components/AppName';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { CallFunctions, ParsedCall, TransactionResponse, TransactionStatus } from '@mimir-wallet/hooks/types';
import { formatAgo } from '@mimir-wallet/utils';

interface Props {
  isOpen: boolean;
  transaction: TransactionResponse;
  approval: number;
  threshold: number;
  dataSize: number;
  parsed: ParsedCall<CallFunctions>;
  multisend?: MetaTransaction[] | null;
  toggleOpen: (value?: unknown) => void;
  openOverview: () => void;
  handleApprove?: (wallet: IWalletClient, client: IPublicClient) => void;
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

function TxItems({
  handleApprove,
  multisend,
  isOpen,
  toggleOpen,
  dataSize,
  parsed,
  transaction,
  approval,
  threshold,
  openOverview
}: Props) {
  const { isConnected, chain } = useAccount();

  return (
    <div className='cursor-pointer h-10 px-3 grid grid-cols-6' onClick={toggleOpen}>
      <div className='col-span-1 flex items-center'>
        <AppName website={transaction.website} />
      </div>
      <div className='col-span-1 flex items-center'>{parsed.functionName}</div>
      <div className='col-span-1 flex items-center text-small'>
        {dataSize ? (
          <CallDetails multisend={multisend} parsed={parsed} />
        ) : (
          <FormatBalance
            prefix='- '
            value={transaction.value}
            decimals={chain?.nativeCurrency.decimals}
            showSymbol
            symbol={chain?.nativeCurrency.symbol}
          />
        )}
      </div>
      <div className='col-span-1 flex items-center'>
        <TimeCell time={transaction.updatedAt} />
      </div>
      <div className='col-span-1 flex items-center'>
        <Button
          onClick={openOverview}
          className='h-7 px-2'
          size='sm'
          variant='bordered'
          radius='full'
          color='primary'
          startContent={<IconMember />}
          endContent={
            <div
              className={`w-2 h-2 rounded-full bg-current ${
                transaction.status === TransactionStatus.Successed
                  ? 'text-success'
                  : transaction.status === TransactionStatus.Failed
                    ? 'text-danger'
                    : transaction.status === TransactionStatus.Pending
                      ? approval >= threshold
                        ? 'text-success'
                        : 'text-warning'
                      : 'text-warning'
              }`}
            />
          }
        >
          {approval}/{threshold}
        </Button>
      </div>
      <div className='col-span-1 flex items-center justify-between'>
        <div className='space-x-2'>
          {transaction.status === TransactionStatus.Pending ? (
            isConnected ? (
              <>
                <ButtonEnable
                  size='tiny'
                  radius='full'
                  variant='light'
                  isIconOnly
                  color='success'
                  onClick={handleApprove}
                >
                  <IconSuccess />
                </ButtonEnable>
                <ButtonEnable size='tiny' radius='full' variant='light' isIconOnly color='danger'>
                  <IconFail />
                </ButtonEnable>
              </>
            ) : null
          ) : (
            <Chip
              color={
                transaction.status === TransactionStatus.Successed
                  ? 'success'
                  : transaction.status === TransactionStatus.Failed
                    ? 'danger'
                    : 'warning'
              }
              variant='light'
              size='sm'
            >
              {TransactionStatus[transaction.status]}
            </Chip>
          )}
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
