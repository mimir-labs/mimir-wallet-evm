// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/hooks/types';
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
  handleExecute: (wallet: IWalletClient, client: IPublicClient) => void;
  handleCancel: (wallet: IWalletClient, client: IPublicClient) => void;
}

function Cell({ tx, handleCancel, handleExecute, cooldown, defaultOpen }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);

  return (
    <TxCell
      isOpen={isOpen}
      data={tx.data}
      to={tx.to}
      value={tx.value}
      items={
        <TxItems
          handleCancel={handleCancel}
          cooldown={cooldown}
          handleExecute={handleExecute}
          tx={tx}
          isOpen={isOpen}
          toggleOpen={toggleOpen}
        />
      }
      details={<Details cooldown={cooldown} tx={tx} />}
    >
      <Process
        handleCancel={handleCancel}
        handleExecute={handleExecute}
        createdAt={tx.createdAt}
        cooldown={cooldown}
        sender={tx.sender}
      />
    </TxCell>
  );
}

export default React.memo(Cell);
