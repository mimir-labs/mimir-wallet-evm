// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ModuleTransactionResponse } from '@mimir-wallet/hooks/types';

import React from 'react';
import { useToggle } from 'react-use';

import { useParseCall, useParseMultisend } from '@mimir-wallet/hooks';

import TxCell from '../tx-cell';
import Details from './Details';
import TxItems from './TxItems';

interface Props {
  defaultOpen?: boolean;
  transaction: ModuleTransactionResponse;
}

function Cell({ transaction, defaultOpen }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const [dataSize, parsed] = useParseCall(transaction.data);
  const multisend = useParseMultisend(parsed);

  return (
    <TxCell
      from={transaction.address}
      isOpen={isOpen}
      data={transaction.data}
      to={transaction.to}
      value={transaction.value}
      items={
        <TxItems
          multisend={multisend}
          isOpen={isOpen}
          toggleOpen={toggleOpen}
          dataSize={dataSize}
          parsed={parsed}
          transaction={transaction}
        />
      }
      details={<Details defaultOpen={defaultOpen} transaction={transaction} />}
    />
  );
}

export default React.memo(Cell);
