// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount } from 'wagmi';

import { SafeTxOverview } from '@mimir-wallet/components';
import { useParseCall, useParseMultisend } from '@mimir-wallet/hooks';
import { type SignatureResponse, type TransactionResponse } from '@mimir-wallet/hooks/types';
import { approveCounts } from '@mimir-wallet/safe';

import TxCell from '../tx-cell';
import Details from './Details';
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
  refetch?: () => void;
}

function Cell({ transaction, allPaths, signatures, account, hasCancelTx, defaultOpen, refetch }: Props) {
  const { address } = useAccount();
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const [isOverviewOpen, toggleOverview] = useToggle(false);
  const approval = useMemo(() => approveCounts(account, signatures), [account, signatures]);
  const [dataSize, parsed] = useParseCall(transaction.data);
  const multisend = useParseMultisend(parsed);

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
            refetch={refetch}
          />
        }
        details={<Details defaultOpen={defaultOpen} address={account.address} transaction={transaction} />}
      >
        <Process
          hasCancelTx={hasCancelTx}
          transaction={transaction}
          filterPaths={filterPaths}
          isSignatureReady={approval >= (account.threshold || 1)}
          signatures={signatures}
          account={account}
          refetch={refetch}
        />
        <div id='safe-tx-modal' />
      </TxCell>
      <Modal size='5xl' placement='center' isOpen={isOverviewOpen} onClose={toggleOverview}>
        <ModalContent>
          <ModalBody>
            <div className='w-full h-[60vh]'>
              <SafeTxOverview onApprove={refetch} transaction={transaction} signatures={signatures} account={account} />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Cell);
