// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount, MetaTransaction } from '@mimir-wallet/safe/types';

import { Chip, CircularProgress } from '@nextui-org/react';
import React from 'react';
import { useAccount, useChains } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-outlined.svg?react';
import IconMember from '@mimir-wallet/assets/svg/icon-member.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { Button, CallDetails, FormatBalance, SafeTxButton } from '@mimir-wallet/components';
import AppName from '@mimir-wallet/components/AppName';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useIsReadOnly } from '@mimir-wallet/hooks';
import {
  CallFunctions,
  ParsedCall,
  SignatureResponse,
  TransactionResponse,
  TransactionStatus
} from '@mimir-wallet/hooks/types';
import { buildSafeTransaction } from '@mimir-wallet/safe';
import { formatAgo } from '@mimir-wallet/utils';

interface OperateCellProps {
  isSignatureReady: boolean;
  account: BaseAccount;
  filterPaths: Array<Address[]>;
  hasCancelTx: boolean;
  isIndexing: boolean;
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
}

interface Props extends OperateCellProps {
  isOpen: boolean;
  approval: number;
  threshold: number;
  dataSize: number;
  parsed: ParsedCall<CallFunctions>;
  multisend?: MetaTransaction[] | null;
  toggleOpen: (value?: unknown) => void;
  openOverview: () => void;
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

function OperateCell({
  isSignatureReady,
  hasCancelTx,
  account,
  filterPaths,
  isIndexing,
  transaction,
  signatures
}: OperateCellProps) {
  const { isConnected } = useAccount();
  const isReadOnly = useIsReadOnly(account);

  return transaction.status === TransactionStatus.Pending ? (
    isIndexing ? (
      <Chip
        color='warning'
        variant='light'
        size='sm'
        startContent={<CircularProgress color='warning' size='sm' classNames={{ svg: 'w-4 h-4' }} />}
      >
        Indexing...
      </Chip>
    ) : (
      isConnected && (
        <>
          {(isSignatureReady || (!isReadOnly && filterPaths.length > 0)) && (
            <SafeTxButton
              isApprove
              isCancel={false}
              isSignatureReady={isSignatureReady}
              safeTx={transaction}
              signatures={signatures}
              address={account.address}
              metadata={{ website: transaction.website, iconUrl: transaction.iconUrl, appName: transaction.appName }}
              size='tiny'
              radius='full'
              variant='light'
              isIconOnly
              color='success'
            >
              <IconSuccess />
            </SafeTxButton>
          )}
          {!isReadOnly && !hasCancelTx && (
            <SafeTxButton
              isApprove={false}
              isCancel
              metadata={{ website: `mimir://internal/cancel-tx?nonce=${transaction.nonce.toString()}` }}
              address={account.address}
              buildTx={async () => buildSafeTransaction(account.address, { value: 0n })}
              cancelNonce={transaction.nonce}
              size='tiny'
              radius='full'
              variant='light'
              isIconOnly
              color='danger'
            >
              <IconFail />
            </SafeTxButton>
          )}
        </>
      )
    )
  ) : (
    <Chip
      color={
        transaction.status === TransactionStatus.Success
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
  );
}

function TxItems({
  isSignatureReady,
  hasCancelTx,
  account,
  filterPaths,
  multisend,
  isOpen,
  isIndexing,
  toggleOpen,
  dataSize,
  parsed,
  transaction,
  signatures,
  approval,
  threshold,
  openOverview
}: Props) {
  const [chain] = useChains();

  return (
    <div className='cursor-pointer h-10 px-3 grid grid-cols-6 gap-2.5' onClick={toggleOpen}>
      <div className='col-span-1 flex items-center'>
        <AppName website={transaction.website} iconUrl={transaction.iconUrl} appName={transaction.appName} />
      </div>
      <div className='col-span-1 flex items-center'>{parsed.functionName}</div>
      <div className='col-span-1 flex items-center text-small'>
        {dataSize ? (
          <CallDetails multisend={multisend} parsed={parsed} />
        ) : (
          <FormatBalance
            prefix='- '
            value={transaction.value}
            decimals={chain.nativeCurrency.decimals}
            showSymbol
            symbol={chain.nativeCurrency.symbol}
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
                transaction.status === TransactionStatus.Success
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
          {transaction.status === TransactionStatus.Success || transaction.status === TransactionStatus.Failed
            ? `${transaction.executeThreshold || 0}/${transaction.executeThreshold || threshold}`
            : `${approval}/${threshold}`}
        </Button>
      </div>
      <div className='col-span-1 flex items-center justify-between'>
        <div className='space-x-2 flex items-center'>
          <OperateCell
            isSignatureReady={isSignatureReady}
            hasCancelTx={hasCancelTx}
            account={account}
            filterPaths={filterPaths}
            isIndexing={isIndexing}
            transaction={transaction}
            signatures={signatures}
          />
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
