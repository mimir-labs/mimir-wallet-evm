// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/features/delay/types';
import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import React from 'react';
import { useToggle } from 'react-use';

import TxCell from '../tx-cell';
import Details from './Details';
import Process from './Process';
import TxItems from './TxItems';

interface Props {
  defaultOpen?: boolean;
  tx: RecoveryTx;
  cooldown?: number;
  expiration?: number;
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => void;
  refetch?: () => void;
}

function Cell({ tx, cooldown, expiration, defaultOpen, handleExecute, refetch }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);

  return (
    <TxCell
      from={tx.address}
      isOpen={isOpen}
      data={tx.data}
      to={tx.to}
      value={tx.value}
      items={
        <TxItems
          cooldown={cooldown}
          expiration={expiration}
          handleExecute={handleExecute}
          tx={tx}
          isOpen={isOpen}
          toggleOpen={toggleOpen}
          refetch={refetch}
        />
      }
      details={<Details cooldown={cooldown} expiration={expiration} tx={tx} />}
    >
      <Process refetch={refetch} tx={tx} handleExecute={handleExecute} cooldown={cooldown} expiration={expiration} />
    </TxCell>
  );
}

export default React.memo(Cell);
