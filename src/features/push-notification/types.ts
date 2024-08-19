// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { MessagePayload } from 'firebase/messaging/sw';
import type { Hash } from 'viem';

export enum WebhookType {
  'tx_created' = 'tx_created',
  'tx_approved' = 'tx_approved',
  'tx_executed' = 'tx_executed'
}

export type TxCreated = {
  type: WebhookType.tx_created;
  chainId: string;
  hash: Hash;
  address: Address;
  creator?: Address;
};

export type TxApproved = {
  type: WebhookType.tx_approved;
  chainId: string;
  hash: Hash;
  address: Address;
  approver: Address;
};
export type TxExecuted = {
  type: WebhookType.tx_executed;
  chainId: string;
  hash: Hash;
  address: Address;
  executor: Address;
};

export type WebhookEvent = TxCreated | TxApproved | TxExecuted;

export function isWebhookEvent(data: MessagePayload['data']): data is WebhookEvent {
  return Object.values(WebhookType).some((type) => type === data?.type);
}
