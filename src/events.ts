// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Events from 'eventemitter3';

type EventTypes = {
  favorite_dapp_added: (id: number) => void;
  favorite_dapp_removed: (id: number) => void;
};

export const events = new Events<EventTypes>();
