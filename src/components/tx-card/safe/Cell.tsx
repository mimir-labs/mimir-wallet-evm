// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount, IPublicClient, IWalletClient, SafeTransaction } from '@mimir-wallet/safe/types';

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import React, { useCallback, useMemo } from 'react';
import { useToggle } from 'react-use';

import { SafeTxOverview } from '@mimir-wallet/components';
import { approveCounts } from '@mimir-wallet/components/safe-tx-modal/utils';
import { useParseCall, useParseMultisend } from '@mimir-wallet/hooks';
import { type SignatureResponse, type TransactionResponse } from '@mimir-wallet/hooks/types';

import TxCell from '../tx-cell';
import Details from './Details';
import Process from './Process';
import TxItems from './TxItems';

interface Props {
  account: BaseAccount;
  handleApprove?: (
    wallet: IWalletClient,
    client: IPublicClient,
    safeTx: SafeTransaction,
    signatures: SignatureResponse[]
  ) => void;
  defaultOpen?: boolean;
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
}

function Cell({ transaction, signatures, account, handleApprove, defaultOpen }: Props) {
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const [isOverviewOpen, toggleOverview] = useToggle(false);
  const approval = useMemo(() => approveCounts(account, signatures), [account, signatures]);
  const [dataSize, parsed] = useParseCall(transaction.data);
  const multisend = useParseMultisend(parsed);

  const _handleApprove = useCallback(
    (wallet: IWalletClient, client: IPublicClient) => {
      return handleApprove?.(wallet, client, transaction, signatures);
    },
    [handleApprove, signatures, transaction]
  );

  return (
    <>
      <TxCell
        isOpen={isOpen}
        data={transaction.data}
        to={transaction.to}
        value={transaction.value}
        items={
          <TxItems
            handleApprove={_handleApprove}
            multisend={multisend}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            dataSize={dataSize}
            parsed={parsed}
            transaction={transaction}
            approval={approval}
            threshold={account.threshold || 1}
            openOverview={toggleOverview}
          />
        }
        details={<Details address={account.address} transaction={transaction} />}
      >
        <Process
          handleApprove={
            handleApprove ? (wallet, client) => handleApprove(wallet, client, transaction, signatures) : undefined
          }
          signatures={signatures}
          account={account}
        />
      </TxCell>
      <Modal size='5xl' placement='center' isOpen={isOverviewOpen} onClose={toggleOverview}>
        <ModalContent>
          <ModalBody>
            <div className='w-full h-[60vh]'>
              <SafeTxOverview signatures={signatures} account={account} />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Cell);
