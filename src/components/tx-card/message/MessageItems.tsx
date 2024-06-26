// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { MessageResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import React, { useContext } from 'react';
import { useAccount } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconMember from '@mimir-wallet/assets/svg/icon-member.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { Button, ButtonEnable } from '@mimir-wallet/components';
import AppName from '@mimir-wallet/components/AppName';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@mimir-wallet/constants';
import { useIsReadOnly } from '@mimir-wallet/hooks';
import { SafeTxContext } from '@mimir-wallet/providers';
import { formatAgo } from '@mimir-wallet/utils';

interface OperateCellProps {
  isSignatureReady: boolean;
  account: BaseAccount;
  filterPaths: Array<Address[]>;
  message: MessageResponse;
}

interface Props extends OperateCellProps {
  isOpen: boolean;
  approval: number;
  threshold: number;
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

function OperateCell({ isSignatureReady, account, filterPaths, message }: OperateCellProps) {
  const { isConnected } = useAccount();
  const isReadOnly = useIsReadOnly(account);
  const { addMessage } = useContext(SafeTxContext);

  return isConnected && !isSignatureReady
    ? (isSignatureReady || (!isReadOnly && filterPaths.length > 0)) && (
        <ButtonEnable
          size='tiny'
          radius='full'
          variant='light'
          isIconOnly
          color='success'
          onClick={() => {
            addMessage({
              address: message.address,
              message: message.mesasge,
              metadata: { website: message.website, iconUrl: message.iconUrl, appName: message.appName }
            });
          }}
        >
          <IconSuccess />
        </ButtonEnable>
      )
    : null;
}

function MessageItems({
  isSignatureReady,
  message,
  account,
  filterPaths,
  isOpen,
  toggleOpen,
  approval,
  threshold,
  openOverview
}: Props) {
  return (
    <div className='cursor-pointer h-10 px-3 grid grid-cols-6 gap-2.5' onClick={toggleOpen}>
      <div className='col-span-2 flex items-center'>
        <AppName website={message.website} iconUrl={message.iconUrl} appName={message.appName} />
      </div>
      <div className='col-span-1 flex items-center text-small'>off-chain signature</div>
      <div className='col-span-1 flex items-center'>
        <TimeCell time={message.createdAt} />
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
            <div className={`w-2 h-2 rounded-full bg-current ${isSignatureReady ? 'text-success' : 'text-warning'}`} />
          }
        >
          {approval}/{threshold}
        </Button>
      </div>
      <div className='col-span-1 flex items-center justify-between'>
        <div className='space-x-2 flex items-center'>
          <OperateCell
            isSignatureReady={isSignatureReady}
            account={account}
            filterPaths={filterPaths}
            message={message}
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

export default React.memo(MessageItems);
