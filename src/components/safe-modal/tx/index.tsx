// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseSafeTx } from '../types';

import { Divider, Switch } from '@nextui-org/react';
import React, { useCallback } from 'react';
import { useToggle } from 'react-use';

import IconBatch from '@mimir-wallet/assets/svg/icon-batch.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import { useBatchTxs, useParseCall } from '@mimir-wallet/hooks';

import Alert from '../../Alert';
import Button from '../../Button';
import ButtonEnable from '../../ButtonEnable';
import SignAndExecute from '../buttons/SignAndExecute';
import AddressChain from '../components/AddressChain';
import BalanceChange from '../components/BalanceChange';
import CustomNonce from '../components/CustomNonce';
import Interact from '../components/Interact';
import SafetyCheck from '../components/SafetyCheck';
import Sender from '../components/Sender';
import TxDetails from '../components/TxDetails';
import { useCloseWhenPathChange } from '../hooks/useCloseWhenPathChange';
import { useHighlightTab } from '../hooks/useHighlightTab';
import { useSafeTx } from '../hooks/useSafeTx';

function SafeTxModal<Approve extends boolean, Cancel extends boolean>(props: UseSafeTx<Approve, Cancel>) {
  const { isApprove, isCancel, metadata, signatures, onSuccess, onClose, address, tx } = props;
  const {
    hasSameTx,
    safeAccount,
    handleSign,
    handleExecute,
    multisig,
    onChainNonce,
    filterPaths,
    safeTx,
    setCustomNonce,
    addressChain,
    simulation,
    setAddressChain,
    executable,
    isSignatureReady,
    isNextSignatureReady,
    refetch
  } = useSafeTx(props);
  const [signOnly, toggleSignOnly] = useToggle(true);
  const [, addTx] = useBatchTxs(address);
  const [dataSize] = useParseCall(tx.data);

  useHighlightTab();
  useCloseWhenPathChange(onClose);

  const handleAddBatch = useCallback(() => {
    addTx([
      {
        ...tx,
        value: tx.value.toString(),
        website: metadata?.website,
        iconUrl: metadata?.iconUrl,
        appName: metadata?.appName
      }
    ]);
    onClose?.();
  }, [addTx, metadata?.appName, metadata?.iconUrl, metadata?.website, onClose, tx]);

  return (
    <div className='w-full sm:space-y-5 space-y-4'>
      <div className='flex items-center justify-between'>
        <h4 className='font-bold text-xl'>{isCancel ? 'Reject Transaction' : 'Submit Transaction'}</h4>
        <Button size='sm' isIconOnly variant='light' radius='full' onClick={onClose}>
          <IconClose />
        </Button>
      </div>

      <div className='w-full flex md:flex-row flex-col md:p-5 p-0 gap-5 md:h-safe-tx-modal-height h-auto overflow-y-auto md:bg-background bg-transparent rounded-large md:shadow-large shadow-none'>
        <div className='md:w-[64%] md:p-0 p-4 md:bg-transparent bg-background w-full space-y-5 rounded-large after:block after:h-5'>
          {isCancel && (
            <Alert
              size='sm'
              severity='warning'
              title={
                <div className='space-y-1.5'>
                  <p>
                    To reject the transaction, a separate rejection transaction will be created to replace the original
                    one.
                  </p>
                  <p>Transaction nonce: {safeTx?.nonce.toString()}</p>
                  <p> You will need to confirm the rejection transaction with your currently connected wallet.</p>
                </div>
              }
            />
          )}

          <Sender address={address} />

          {dataSize > 0n && <Interact address={tx.to} />}

          <TxDetails isCancel={isCancel} safeTx={safeTx} tx={tx} address={address} />

          {simulation.assetChange.length > 0 && (
            <BalanceChange address={address} assetChange={simulation.assetChange} />
          )}

          <SafetyCheck simulation={simulation} />
        </div>

        <div className='sticky top-0 self-start md:w-[36%] w-full h-auto sm:p-5 p-4 space-y-5 rounded-large shadow-large md:bg-transparent bg-background'>
          {isSignatureReady ? null : multisig ? (
            <AddressChain
              filterPaths={filterPaths}
              addressChain={addressChain}
              setAddressChain={setAddressChain}
              deep={0}
              multisig={multisig}
            />
          ) : null}

          <CustomNonce
            safeTx={safeTx}
            address={address}
            isApprove={isApprove}
            isCancel={isCancel}
            setCustomNonce={setCustomNonce}
          />
          <Divider />

          {isNextSignatureReady && (
            <div className='flex justify-between items-center'>
              <b className='text-small'>Sign Only</b>
              <Switch size='sm' isSelected={signOnly} onValueChange={toggleSignOnly} />
            </div>
          )}

          {!isApprove && hasSameTx && (
            <Alert severity='warning' title='You already have a pending transaction with the same action.' />
          )}

          {isCancel && (
            <Alert
              severity='warning'
              title={`This transaction is to reject transaction with nonce: ${safeTx?.nonce.toString()}`}
            />
          )}

          {onChainNonce !== undefined && safeTx && safeTx.nonce < onChainNonce && (
            <Alert severity='error' title={`The nonce should be greater or equal than ${onChainNonce}.`} />
          )}

          <div className='flex gap-2.5'>
            {isSignatureReady ? (
              <ButtonEnable
                isToastError
                onClick={handleExecute}
                color={simulation.isSuccess ? 'primary' : 'warning'}
                fullWidth
                radius='full'
                disabled={!safeTx || !executable}
                isLoading={simulation.isPending}
                withConnect
              >
                {simulation.isSuccess ? 'Execute' : 'Execute Anyway'}
              </ButtonEnable>
            ) : !signOnly ? (
              <SignAndExecute
                safeAddress={address}
                safeAccount={safeAccount}
                simulation={simulation}
                safeTx={safeTx}
                addressChain={addressChain}
                signatures={signatures || []}
                isApprove={isApprove}
                hasSameTx={hasSameTx}
                executable={executable}
                onChainNonce={onChainNonce}
                metadata={metadata}
                onSuccess={onSuccess}
                refetch={refetch}
              />
            ) : (
              <ButtonEnable
                isToastError
                onClick={handleSign}
                color='primary'
                fullWidth
                radius='full'
                disabled={
                  !safeTx || (!isApprove && hasSameTx) || (onChainNonce !== undefined && safeTx.nonce < onChainNonce)
                }
                isLoading={simulation.isPending}
                withConnect
              >
                Sign
              </ButtonEnable>
            )}
          </div>

          {!isApprove && !isCancel && (
            <Button
              fullWidth
              radius='full'
              onClick={handleAddBatch}
              color='primary'
              variant='bordered'
              startContent={<IconBatch />}
            >
              Add To Cache
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo<typeof SafeTxModal>(SafeTxModal) as typeof SafeTxModal;
