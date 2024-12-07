// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/features/delay/types';

import dayjs from 'dayjs';
import React from 'react';
import { useToggle } from 'react-use';

import { AddressRow, Bytes, FormatBalance } from '@mimir-wallet/components';
import { useCurrentChain } from '@mimir-wallet/hooks';
import { Operation } from '@mimir-wallet/safe/types';

import { Item } from '../tx-cell/Details';

interface Props {
  tx: RecoveryTx;
  cooldown?: number;
  expiration?: number;
}

function Details({ tx, cooldown, expiration }: Props) {
  const [isOpen, toggleOpen] = useToggle(false);
  const [, chain] = useCurrentChain();

  return (
    <>
      <Item label='Transaction Hash' content={tx.transaction} />
      <Item label='Created' content={dayjs(tx.createdAt).format()} />
      {cooldown && <Item label='Executable' content={dayjs(tx.createdAt + cooldown).format()} />}
      {expiration && cooldown && (
        <Item label='Expiration' content={dayjs(tx.createdAt + cooldown + expiration).format()} />
      )}

      <div onClick={toggleOpen} className='cursor-pointer text-primary font-bold text-small'>
        View Details
      </div>

      {isOpen && (
        <>
          <Item label='Module' content={<AddressRow iconSize={16} withCopy address={tx.address} />} />
          <Item label='Value' content={<FormatBalance value={tx.value} showSymbol {...chain?.nativeCurrency} />} />
          <Item label='Operation' content={Operation[tx.operation]} />
          <Item label='Raw Data' content={<Bytes data={tx.data} />} />
        </>
      )}
    </>
  );
}

export default React.memo(Details);
