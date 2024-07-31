// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IPublicClient, MetaTransaction } from '../types';

import { type Address, encodeFunctionData, getAddress, isAddressEqual } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { deployments } from '@mimir-wallet/config';
import { assert, diffArray } from '@mimir-wallet/utils';

import { getOwners, getOwnersMap, getThreshold, SENTINEL_OWNERS } from '../account';
import { buildMultiSendSafeTx, buildSafeTransaction } from '../transaction';
import { Operation } from '../types';

// @internal
// find the prev owner
function findPrevOwner(owners: Map<Address, Address | null>, owner: Address): Address {
  let prevOwner: Address | null = null;

  for (const [prev, current] of owners) {
    if (current) {
      if (isAddressEqual(current, owner)) {
        prevOwner = prev;
      }
    }
  }

  if (!prevOwner) {
    throw new Error(`Cant find prevOwner for owner(${owner})`);
  }

  return prevOwner;
}

export async function buildChangeMember(
  client: IPublicClient,
  safeAddress: Address,
  newMembers: Address[],
  newThreshold: bigint | number | string
): Promise<MetaTransaction> {
  const multisendAddress = deployments[client.chain.id]?.MultiSend[0];

  assert(multisendAddress, `multisend not support on ${client.chain.name}`);

  const oldMembers = await getOwners(client, safeAddress);

  newMembers = newMembers.map((item) => getAddress(item));
  newThreshold = BigInt(newThreshold);

  if (BigInt(newMembers.length) < newThreshold) {
    throw new Error(`Threshold cannot exceed owner count`);
  }

  let threshold = await getThreshold(client, safeAddress);
  const ownersMap = await getOwnersMap(client, safeAddress);
  let ownerCount = ownersMap.size;

  const txs: MetaTransaction[] = [];

  const { change, add, remove } = diffArray(oldMembers, newMembers);

  // add swap owner call
  for (const [from, to] of change) {
    const prevOwner = findPrevOwner(ownersMap, from);

    txs.push({
      to: safeAddress,
      value: 0n,
      operation: Operation.Call,
      data: encodeFunctionData({
        abi: abis.SafeL2,
        functionName: 'swapOwner',
        args: [prevOwner, from, to]
      })
    });

    const nextOwner = ownersMap.get(from);

    if (nextOwner) {
      ownersMap.set(to, nextOwner);
    }

    ownersMap.set(prevOwner, to);
    ownersMap.delete(from);
  }

  // add add owner call
  for (const item of add) {
    txs.push({
      to: safeAddress,
      value: 0n,
      operation: Operation.Call,
      data: encodeFunctionData({
        abi: abis.SafeL2,
        functionName: 'addOwnerWithThreshold',
        args: [item, threshold]
      })
    });
    const nextOwner = ownersMap.get(SENTINEL_OWNERS);

    if (nextOwner) {
      ownersMap.set(item, nextOwner);
    }

    ownersMap.set(SENTINEL_OWNERS, item);
    ownerCount++;
  }

  // add remove owner call
  for (const item of remove) {
    const prevOwner = findPrevOwner(ownersMap, item);

    txs.push({
      to: safeAddress,
      value: 0n,
      operation: Operation.Call,
      data: encodeFunctionData({
        abi: abis.SafeL2,
        functionName: 'removeOwner',
        args: [prevOwner, item, newThreshold]
      })
    });

    const nextOwner = ownersMap.get(item);

    if (nextOwner) {
      ownersMap.set(prevOwner, nextOwner);
    }

    ownersMap.delete(item);
    threshold = newThreshold;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ownerCount--;
  }

  // change threshold
  if (threshold !== newThreshold) {
    txs.push({
      to: safeAddress,
      value: 0n,
      operation: Operation.Call,
      data: encodeFunctionData({
        abi: abis.SafeL2,
        functionName: 'changeThreshold',
        args: [newThreshold]
      })
    });
  }

  if (txs.length > 1) {
    return buildMultiSendSafeTx(client.chain, txs);
  }

  if (txs.length === 1) {
    return buildSafeTransaction(safeAddress, {
      data: txs[0].data,
      operation: Operation.Call
    });
  }

  throw new Error('No member to change');
}
