// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReceivedResponse } from '@mimir-wallet/hooks/types';

import { Card, CardBody } from '@nextui-org/react';
import React from 'react';

import Cell from './Cell';

interface Props {
  defaultOpen?: boolean;
  data: ReceivedResponse;
}

function ReceivedTxCard({ defaultOpen, data }: Props) {
  return (
    <Card>
      <CardBody className='space-y-3'>
        <Cell defaultOpen={defaultOpen} transaction={data} />
      </CardBody>
    </Card>
  );
}

export default React.memo(ReceivedTxCard);
