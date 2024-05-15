// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { TokenMeta } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressIcon, AddressRow, FormatBalance, SafeTxButton } from '@mimir-wallet/components';
import { useAllowanceDelegates, useAllowanceTokens, useTokens } from '@mimir-wallet/hooks';
import { buildDeleteAllowance } from '@mimir-wallet/safe';

type Allowance = [amount: bigint, spent: bigint, resetTimeMin: bigint, lastResetMin: bigint, nonce: bigint];

function Row({
  delegate,
  token,
  ercTokens,
  allowance,
  safeAccount
}: {
  ercTokens: Record<Address, TokenMeta>;
  safeAccount: Address;
  delegate: Address;
  token: Address;
  allowance: Allowance;
}) {
  const { chain } = useAccount();

  const resetTime = allowance[2]
    ? dayjs(Number(allowance[3] + allowance[2]) * 60 * 1000).format('YYYY-MM-DD HH:mm')
    : 'Once';

  return (
    <>
      <div className='col-span-4'>
        <AddressRow iconSize={20} address={delegate} withCopy />
      </div>
      <div className='col-span-3'>
        <FormatBalance
          prefix={<AddressIcon isToken address={token} size={20} />}
          value={allowance[0] - allowance[1]}
          symbol={ercTokens[token]?.symbol || chain?.nativeCurrency.symbol}
          decimals={ercTokens[token]?.decimals || chain?.nativeCurrency.decimals}
          showSymbol
        />
      </div>
      <div className='col-span-3 flex items-center justify-between'>
        {resetTime}

        <SafeTxButton
          website='mimir://internal/spend-limit'
          isApprove={false}
          isCancel={false}
          address={safeAccount}
          buildTx={(_, client) => buildDeleteAllowance(client, safeAccount, delegate, token)}
          isToastError
          isIconOnly
          color='danger'
          size='tiny'
          variant='light'
        >
          <IconDelete />
        </SafeTxButton>
      </div>
    </>
  );
}

function Delegates({ safeAccount }: { safeAccount: Address }) {
  const delegates = useAllowanceDelegates(safeAccount);
  const data = useAllowanceTokens(safeAccount, delegates);
  const tokens = useMemo(() => Array.from(new Set(data.map((item) => item.token))), [data]);
  const ercTokens = useTokens(tokens);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-10 gap-2.5'>
      <div className='col-span-4 text-default-300'>Beneficiary</div>
      <div className='col-span-3 text-default-300'>Token Limit</div>
      <div className='col-span-3 text-default-300'>Reset Time</div>
      {data.map(({ token, delegate, allowance }) => (
        <Row
          safeAccount={safeAccount}
          ercTokens={ercTokens}
          allowance={allowance}
          delegate={delegate}
          token={token}
          key={`${delegate}-${token}`}
        />
      ))}
    </div>
  );
}

export default React.memo(Delegates);
