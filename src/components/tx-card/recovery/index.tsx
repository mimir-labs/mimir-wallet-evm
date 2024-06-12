// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RecoveryTx } from '@mimir-wallet/features/delay/types';
import type { SignatureResponse, TransactionResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount, IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Card, CardBody, CardHeader, Divider, Link } from '@nextui-org/react';
import React, { useCallback, useMemo } from 'react';
import { size, toFunctionSelector } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { memberPaths } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import SafeTxCell from '../safe/Cell';
import Cell from './Cell';

interface Props {
  account?: BaseAccount | null;
  defaultOpen?: boolean;
  tx: RecoveryTx;
  pendingTxs: { transaction: TransactionResponse; signatures: SignatureResponse[] }[];
  refetch?: () => void;
}

function RecoveryTxCard({ account, defaultOpen, tx, pendingTxs, refetch }: Props) {
  const { address: signer } = useAccount();
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
  const expiration = data ? Number(data[1]) * 1000 : undefined;

  const cancelTxs = useMemo(
    () =>
      pendingTxs.filter(
        (item) =>
          addressEq(item.transaction.to, tx.address) &&
          item.transaction.data.startsWith(toFunctionSelector('function setTxNonce(uint256)'))
      ),
    [pendingTxs, tx.address]
  );
  const allPaths = useMemo(() => (account && signer ? memberPaths(account, signer) : []), [account, signer]);

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

  return (
    <Card>
      {cancelTxs.length > 0 && (
        <CardHeader className='text-tiny'>
          Cancelling Account recovery. You will need to execute cancelling transaction.{' '}
          <Link
            href='https://help.safe.global/en/articles/110656-account-recovery-with-safe-recoveryhub'
            isExternal
            className='text-tiny'
          >
            Why did this happen?
          </Link>
        </CardHeader>
      )}
      <Divider className='mx-3 w-auto' />
      {account ? (
        <CardBody className='space-y-3'>
          {cancelTxs.map((item) => (
            <SafeTxCell
              allPaths={allPaths}
              account={account}
              hasCancelTx={
                cancelTxs.findIndex(
                  (item) =>
                    size(item.transaction.data) === 0 &&
                    item.transaction.value === 0n &&
                    addressEq(item.transaction.to, item.transaction.address)
                ) > -1
              }
              key={item.transaction.hash}
              defaultOpen={false}
              transaction={item.transaction}
              signatures={item.signatures}
            />
          ))}
          <Cell
            handleExecute={execute}
            cooldown={cooldown ? Number(cooldown) : undefined}
            expiration={expiration ? Number(expiration) : undefined}
            defaultOpen={defaultOpen}
            tx={tx}
            refetch={refetch}
          />
        </CardBody>
      ) : null}
    </Card>
  );
}

export default React.memo(RecoveryTxCard);
