// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { MessageResponse, SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils';
import { Divider, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { AnimatePresence, domAnimation, LazyMotion, motion, useWillChange } from 'framer-motion';
import React, { useContext, useMemo } from 'react';
import { useToggle } from 'react-use';
import { useAccount } from 'wagmi';

import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { ButtonEnable, SignatureOverview } from '@mimir-wallet/components';
import { useIsReadOnly } from '@mimir-wallet/hooks';
import { SafeTxContext } from '@mimir-wallet/providers';
import { approveCounts } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import Details from './Details';
import MessageItems from './MessageItems';
import Operate from './Operate';
import Process from './Process';
import { findWaitApproveFilter } from './utils';

interface Props {
  account: BaseAccount;
  allPaths: Array<Address[]>;
  defaultOpen?: boolean;
  message: MessageResponse;
  signatures: SignatureResponse[];
}

function Cell({ message, allPaths, signatures, account, defaultOpen }: Props) {
  const { addMessage } = useContext(SafeTxContext);
  const { address: walletAddress } = useAccount();
  const [isOpen, toggleOpen] = useToggle(defaultOpen || false);
  const [isOverviewOpen, toggleOverview] = useToggle(false);
  const approval = useMemo(() => approveCounts(account, signatures, true), [account, signatures]);
  const isReadOnly = useIsReadOnly(account);
  const willChange = useWillChange();

  const filterPaths = useMemo(
    () => (walletAddress ? findWaitApproveFilter(allPaths, signatures, walletAddress) : []),
    [walletAddress, allPaths, signatures]
  );

  const operate = (address: Address, addressChain: Address[], isApprove: boolean) => {
    if (addressEq(address, walletAddress) && !isApprove) {
      return (
        <ButtonEnable
          startContent={<IconSuccess />}
          fullWidth
          size='sm'
          color='success'
          radius='none'
          className='flex bg-success/10 border-none text-success'
          variant='flat'
          withConnect
          onClick={() => {
            toggleOverview(false);
            addMessage({
              address: message.address,
              message: message.mesasge,
              addressChain,
              metadata: { website: message.website, iconUrl: message.iconUrl, appName: message.appName }
            });
          }}
        >
          Approve
        </ButtonEnable>
      );
    }

    return null;
  };

  return (
    <>
      <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden transition-all'>
        <MessageItems
          isSignatureReady={approval >= (account.threshold || 1)}
          account={account}
          filterPaths={filterPaths}
          isOpen={isOpen}
          toggleOpen={toggleOpen}
          message={message}
          approval={approval}
          threshold={account.threshold || 1}
          openOverview={toggleOverview}
        />

        <AnimatePresence>
          {isOpen ? (
            <LazyMotion features={domAnimation}>
              <motion.div
                animate='enter'
                exit='exit'
                initial='exit'
                style={{ overflowY: 'hidden', willChange }}
                variants={TRANSITION_VARIANTS.collapse}
              >
                <div className='flex justify-between gap-3 p-3 mb-3 ml-3 mr-3 bg-white rounded-medium'>
                  <Details message={message} />

                  <Divider className='sm:hidden block' />

                  {(!isReadOnly || signatures.length > 0) && (
                    <Process signatures={signatures} account={account}>
                      <Operate
                        account={account}
                        filterPaths={filterPaths}
                        message={message}
                        isSignatureReady={approval >= (account.threshold || 1)}
                      />
                    </Process>
                  )}
                </div>
              </motion.div>
            </LazyMotion>
          ) : null}
        </AnimatePresence>
      </div>

      <Modal size='5xl' placement='center' isOpen={isOverviewOpen} onClose={toggleOverview}>
        <ModalContent>
          <ModalBody>
            <div className='w-full h-[60vh]'>
              <SignatureOverview signatures={signatures} account={account} operate={operate} />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Cell);
