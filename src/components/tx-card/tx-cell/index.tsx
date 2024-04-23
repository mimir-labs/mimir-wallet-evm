// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount, IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';

import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount } from 'wagmi';

import { approveCounts } from '@mimir-wallet/components/safe-tx-modal/utils';
import SafeTxOverview from '@mimir-wallet/components/SafeTxOverview';
import { useParseCall, useParseMultisend } from '@mimir-wallet/hooks';
import { SignatureResponse, type TransactionResponse } from '@mimir-wallet/hooks/types';
import { hashSafeTransaction } from '@mimir-wallet/safe';

import Details from './Details';
import Process from './Process';
import TxItems from './TxItems';

interface Props {
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
  account: BaseAccount;
  threshold: number;
  defaultOpen?: boolean;
  handleApprove?: (wallet: IWalletClient, client: IPublicClient) => void;
}

function TxCell({ handleApprove, defaultOpen, transaction, account, signatures, threshold }: Props) {
  const approval = useMemo(() => approveCounts(account, signatures), [account, signatures]);
  const { chain } = useAccount();
  const hash = useMemo(
    () => (chain ? hashSafeTransaction(chain, account.address, transaction) : '0x'),
    [account.address, chain, transaction]
  );
  const [dataSize, parsed] = useParseCall(transaction.data);
  const multisend = useParseMultisend(parsed);

  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const [isOverviewOpen, toggleOverview] = useToggle(false);

  return (
    <>
      <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden transition-all'>
        <TxItems
          openOverview={toggleOverview}
          isOpen={isOpen}
          toggleOpen={toggleOpen}
          dataSize={dataSize}
          parsed={parsed}
          multisend={multisend}
          transaction={transaction}
          approval={approval}
          threshold={threshold}
          handleApprove={handleApprove}
        />
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: 1000 }}
              exit={{
                opacity: 0,
                maxHeight: 1000,
                height: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0
              }}
              className='flex justify-between gap-3 p-3 mb-3 ml-3 mr-3 bg-white rounded-medium overflow-y-auto'
            >
              <Details hash={hash} transaction={transaction} />
              <Process handleApprove={handleApprove} signatures={signatures} account={account} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
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

export default React.memo(TxCell);
