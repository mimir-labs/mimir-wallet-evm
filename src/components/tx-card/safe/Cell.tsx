// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount } from 'wagmi';

import { SafeTxOverview } from '@mimir-wallet/components';
import { useParseCall, useParseMultisend, useTxIsIndexing } from '@mimir-wallet/hooks';
import { type SignatureResponse, type TransactionResponse, TransactionStatus } from '@mimir-wallet/hooks/types';
import { approveCounts } from '@mimir-wallet/safe';

import TxCell from '../tx-cell';
import Details from './Details';
import Operate from './Operate';
import Process from './Process';
import TxItems from './TxItems';
import { findWaitApproveFilter } from './utils';

interface Props {
  account: BaseAccount;
  allPaths: Array<Address[]>;
  defaultOpen?: boolean;
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
  hasCancelTx: boolean;
}

function Cell({ transaction, allPaths, signatures, account, hasCancelTx, defaultOpen }: Props) {
  const { address } = useAccount();
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const [isOverviewOpen, toggleOverview] = useToggle(false);
  const approval = useMemo(() => approveCounts(account, signatures, true), [account, signatures]);
  const [dataSize, parsed] = useParseCall(transaction.data);
  const multisend = useParseMultisend(parsed);
  const isIndexing = useTxIsIndexing(transaction.address, transaction.status, transaction.nonce);

  const filterPaths = useMemo(
    () => (address ? findWaitApproveFilter(allPaths, signatures, address) : []),
    [address, allPaths, signatures]
  );

  return (
    <>
      <TxCell
        from={transaction.address}
        isOpen={isOpen}
        data={transaction.data}
        to={transaction.to}
        value={transaction.value}
        items={
          <TxItems
            isIndexing={isIndexing}
            hasCancelTx={hasCancelTx}
            isSignatureReady={approval >= (account.threshold || 1)}
            account={account}
            filterPaths={filterPaths}
            multisend={multisend}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            dataSize={dataSize}
            parsed={parsed}
            transaction={transaction}
            signatures={signatures}
            approval={approval}
            threshold={account.threshold || 1}
            openOverview={toggleOverview}
          />
        }
        details={<Details defaultOpen={defaultOpen} address={account.address} transaction={transaction} />}
      >
        {(!account.isReadOnly || signatures.length > 0) && (
          <Process signatures={signatures} account={account}>
            {transaction.status > TransactionStatus.Pending || isIndexing ? null : (
              <Operate
                hasCancelTx={hasCancelTx}
                transaction={transaction}
                filterPaths={filterPaths}
                isSignatureReady={approval >= (account.threshold || 1)}
                signatures={signatures}
                account={account}
              />
            )}
          </Process>
        )}
      </TxCell>
      <Modal size='5xl' placement='center' isOpen={isOverviewOpen} onClose={toggleOverview}>
        <ModalContent>
          <ModalBody>
            <div className='w-full h-[60vh]'>
              <SafeTxOverview
                onClose={toggleOverview}
                transaction={transaction}
                signatures={signatures}
                account={account}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Cell);
