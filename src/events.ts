// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from './hooks/types';

import Events from 'eventemitter3';

type EventTypes = {
  batch_tx_added: (value: BatchTxItem) => void;
};

export const events = new Events<EventTypes>();
