// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Token } from '@mimir-wallet/hooks/types';

import dayjs from 'dayjs';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressRow, ButtonEnable, FormatBalance, TokenIcon } from '@mimir-wallet/components';
import { useAllowanceDelegates, useAllowanceTokens, useTokens } from '@mimir-wallet/hooks';
import { SafeContext } from '@mimir-wallet/providers';
import { buildDeleteAllowance } from '@mimir-wallet/safe';
import { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

type Allowance = [amount: bigint, spent: bigint, resetTimeMin: bigint, lastResetMin: bigint, nonce: bigint];

function Row({
  delegate,
  token,
  ercTokens,
  allowance,
  safeAccount
}: {
  ercTokens: Record<Address, Token>;
  safeAccount: Address;
  delegate: Address;
  token: Address;
  allowance: Allowance;
}) {
  const { openTxModal } = useContext(SafeContext);
  const { chain } = useAccount();
  const navigate = useNavigate();

  const resetTime = allowance[2] ? dayjs(Number(allowance[3] + allowance[2]) * 60 * 1000).format() : 'Once';

  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      const safeTx = await buildDeleteAllowance(client, safeAccount, delegate, token);

      openTxModal(
        {
          website: 'mimir://internal/spend-limit',
          isApprove: false,
          address: safeAccount,
          safeTx
        },
        () => navigate('/transactions')
      );
    },
    [delegate, navigate, openTxModal, safeAccount, token]
  );

  return (
    <>
      <div className='col-span-3'>
        <AddressRow iconSize={20} address={delegate} />
      </div>
      <div className='col-span-3'>
        <FormatBalance
          prefix={<TokenIcon address={token} size={20} />}
          value={allowance[0] - allowance[1]}
          symbol={ercTokens[token]?.symbol || chain?.nativeCurrency.symbol}
          decimals={ercTokens[token]?.decimals || chain?.nativeCurrency.decimals}
          showSymbol
        />
      </div>
      <div className='col-span-3'>{resetTime}</div>
      <div className='col-span-1'>
        <ButtonEnable onClick={handleClick} isToastError isIconOnly color='danger' size='tiny' variant='light'>
          <IconDelete />
        </ButtonEnable>
      </div>
    </>
  );
}

function Delegates({ safeAccount }: { safeAccount: Address }) {
  const delegates = useAllowanceDelegates(safeAccount);
  const data = useAllowanceTokens(safeAccount, delegates);
  const tokens = useMemo(() => Array.from(new Set(data.map((item) => item.token))), [data]);
  const ercTokens = useTokens(tokens);

  return (
    <div className='grid grid-cols-10 gap-2.5'>
      <div className='col-span-3 text-default-300'>Beneficiary</div>
      <div className='col-span-3 text-default-300'>Token Limit</div>
      <div className='col-span-4 text-default-300'>Reset Time</div>
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
