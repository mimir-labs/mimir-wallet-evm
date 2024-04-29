// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { RecoveryTx, SignatureResponse, TransactionResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount, IPublicClient, IWalletClient, SafeTransaction } from '@mimir-wallet/safe/types';

import { Card, CardBody, CardHeader, Divider, Link } from '@nextui-org/react';
import React, { useCallback, useMemo } from 'react';
import { toFunctionSelector } from 'viem';
import { useReadContracts } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { addressEq } from '@mimir-wallet/utils';

import SafeTxCell from '../safe/Cell';
import Cell from './Cell';

interface Props {
  account?: BaseAccount | null;
  defaultOpen?: boolean;
  tx: RecoveryTx;
  pendingTxs: { transaction: TransactionResponse; signatures: SignatureResponse[] }[];
  handleCancel: (wallet: IWalletClient, client: IPublicClient, address: Address, cancel: bigint) => void;
  handleApproveCancel?: (
    wallet: IWalletClient,
    client: IPublicClient,
    safeTx: SafeTransaction,
    signatures: SignatureResponse[]
  ) => void;
}

function RecoveryTxCard({ handleCancel, account, defaultOpen, tx, pendingTxs, handleApproveCancel }: Props) {
  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: tx.address,
        abi: abis.Delay,
        functionName: 'txCooldown'
      },
      {
        address: tx.address,
        abi: abis.Delay,
        functionName: 'txExpiration'
      },
      {
        address: tx.address,
        abi: abis.Delay,
        functionName: 'txCreatedAt',
        args: [tx.queueNonce]
      }
    ]
  });

  const cooldown = data ? Number(data[0]) * 1000 : undefined;

  const cancelTxs = useMemo(
    () =>
      pendingTxs.filter(
        (item) =>
          addressEq(item.transaction.to, tx.address) &&
          item.transaction.data.startsWith(toFunctionSelector('function setTxNonce(uint256)'))
      ),
    [pendingTxs, tx.address]
  );

  const execute = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      const { request } = await client.simulateContract({
        address: tx.address,
        abi: abis.Delay,
        functionName: 'executeNextTx',
        args: [tx.to, tx.value, tx.data, tx.operation]
      });

      await wallet.writeContract(request);
    },
    [tx.address, tx.data, tx.operation, tx.to, tx.value]
  );

  const cancel = useCallback(
    (wallet: IWalletClient, client: IPublicClient) => handleCancel(wallet, client, tx.address, tx.queueNonce),
    [handleCancel, tx.address, tx.queueNonce]
  );

  return (
    <Card>
      <CardHeader className='text-tiny'>
        Cancelling Account recovery. You will need &nbsp;
        <Link isExternal href='.' className='text-tiny'>
          Why did this happen?
        </Link>
      </CardHeader>
      <Divider className='mx-3 w-auto' />
      {account ? (
        <CardBody className='space-y-3'>
          {cancelTxs.map((item) => (
            <SafeTxCell
              account={account}
              handleApprove={handleApproveCancel}
              key={item.transaction.hash}
              defaultOpen={false}
              transaction={item.transaction}
              signatures={item.signatures}
            />
          ))}
          <Cell
            handleExecute={execute}
            handleCancel={cancel}
            cooldown={cooldown ? Number(cooldown) : undefined}
            defaultOpen={defaultOpen}
            tx={tx}
          />
        </CardBody>
      ) : null}
    </Card>
  );
}

export default React.memo(RecoveryTxCard);
