// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/hooks/types';

import { Divider } from '@nextui-org/react';
import dayjs from 'dayjs';
import React from 'react';
import { useAccount } from 'wagmi';

import { AddressRow, Bytes, FormatBalance } from '@mimir-wallet/components';
import { Operation } from '@mimir-wallet/safe/types';

import { Item } from '../tx-cell/Details';

interface Props {
  tx: RecoveryTx;
  cooldown?: number;
}

function Details({ tx, cooldown }: Props) {
  const { chain } = useAccount();

  return (
    <>
      <Item label='Transaction Hash' content={tx.transaction} />
      <Item label='Created' content={dayjs(tx.createdAt).format()} />
      {cooldown && <Item label='Executable' content={dayjs(tx.createdAt + cooldown).format()} />}
      <Divider />
      <Item label='Module' content={<AddressRow iconSize={16} withCopy address={tx.address} />} />
      <Item label='Value' content={<FormatBalance value={tx.value} showSymbol {...chain?.nativeCurrency} />} />
      <Item label='Operation' content={Operation[tx.operation]} />
      <Item label='Raw Data' content={<Bytes data={tx.data} />} />
    </>
  );
}

export default React.memo(Details);
