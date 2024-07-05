// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseSafeMessage } from '../types';

import { Divider, Spinner } from '@nextui-org/react';
import React from 'react';
import { useToggle } from 'react-use';

import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import Alert from '@mimir-wallet/components/Alert';
import ButtonEnable from '@mimir-wallet/components/ButtonEnable';
import CopyButton from '@mimir-wallet/components/CopyButton';
import Progress from '@mimir-wallet/components/tx-card/message/Process';
import { buildBytesSignatures } from '@mimir-wallet/safe';

import Button from '../../Button';
import SignMessageButton from '../buttons/SignMessageButton';
import AddressChain from '../components/AddressChain';
import AppInfo from '../components/AppInfo';
import Message from '../components/Message';
import MessageDetails from '../components/MessageDetails';
import Signatures from '../components/Signatures';
import { useCloseWhenPathChange } from '../hooks/useCloseWhenPathChange';
import { useHighlightTab } from '../hooks/useHighlightTab';
import { useSafeMessage } from '../hooks/useSafeMessage';
import { buildSigTree, findValidSignature } from '../utils';

function SafeMessageModal(props: UseSafeMessage) {
  const { metadata, onClose, onSuccess, address, message, requestId, onFinal } = props;
  const {
    safeAccount,
    hash,
    safeMessage,
    messageSignature,
    multisig,
    filterPaths,
    addressChain,
    setAddressChain,
    isSignatureReady,
    finalSignature,
    isFetched,
    isFetching,
    refetch
  } = useSafeMessage(props);
  const [isOverviewOpen, toggleOverview] = useToggle(false);

  useHighlightTab();
  useCloseWhenPathChange(onClose);

  if (!isFetched) {
    return <div className='w-full'>{isFetching ? <Spinner color='primary' size='lg' /> : null}</div>;
  }

  return (
    <>
      <div className='w-full'>
        <div className='flex items-center justify-between mb-5'>
          <h4 className='font-bold text-xl'>Confirm Message</h4>
          <Button size='sm' isIconOnly variant='light' radius='full' onClick={onClose}>
            <IconClose />
          </Button>
        </div>

        <div className='w-full flex gap-5 p-5 h-safe-tx-modal-height overflow-y-auto bg-background rounded-large shadow-large'>
          <div className='w-[64%] flex flex-col gap-5 after:block after:h-5'>
            <AppInfo {...metadata} />

            <Message message={message} />

            <MessageDetails hash={hash} safeMessage={safeMessage} />
          </div>

          <div className='sticky top-0 self-start w-[36%] h-auto p-5 space-y-5 rounded-large shadow-large'>
            {messageSignature && safeAccount && (
              <>
                <Progress account={safeAccount} signatures={messageSignature.signatures} className='w-full'>
                  <Button variant='bordered' color='primary' fullWidth onClick={toggleOverview}>
                    Overview
                  </Button>
                </Progress>
                <Divider />
              </>
            )}

            {isSignatureReady || filterPaths.length === 0 ? null : multisig ? (
              <>
                <AddressChain
                  filterPaths={filterPaths}
                  addressChain={addressChain}
                  setAddressChain={setAddressChain}
                  deep={0}
                  multisig={multisig}
                />
                <Divider />
              </>
            ) : null}

            {!isSignatureReady && filterPaths.length === 0 && (
              <Alert severity='warning' title='Waiting for other members’ approvement.' />
            )}

            {finalSignature && (
              <Alert
                severity='success'
                title='This message signature is sign final'
                content={
                  <p className='flex items-center'>
                    Copy Signature <CopyButton color='success' value={finalSignature} size='tiny' />
                  </p>
                }
              />
            )}

            {requestId && (
              <Alert
                severity='warning'
                title='Please do not close the popup or the application until all signatures are completed.'
              />
            )}

            <div className='flex gap-2.5'>
              {!isSignatureReady && (
                <SignMessageButton
                  safeAccount={safeAccount}
                  safeAddress={address}
                  addressChain={addressChain}
                  message={message}
                  filterPaths={filterPaths}
                  {...metadata}
                  onSuccess={(signature) => {
                    onSuccess?.(signature);
                    refetch();
                  }}
                />
              )}

              {isSignatureReady && safeAccount && messageSignature && requestId && onFinal && (
                <ButtonEnable
                  isToastError
                  onClick={() => {
                    onFinal(
                      buildBytesSignatures(
                        buildSigTree(safeAccount, findValidSignature(safeAccount, messageSignature.signatures))
                      ),
                      hash
                    );
                  }}
                  color='primary'
                  fullWidth
                  radius='full'
                  withConnect
                >
                  Continue
                </ButtonEnable>
              )}
            </div>
          </div>
        </div>
      </div>

      <Signatures
        safeAccount={safeAccount}
        isOpen={isOverviewOpen}
        onClose={toggleOverview}
        signatures={messageSignature?.signatures}
      />
    </>
  );
}

export default React.memo<typeof SafeMessageModal>(SafeMessageModal) as typeof SafeMessageModal;
