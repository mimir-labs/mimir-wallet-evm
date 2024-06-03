// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseSafeTx } from './types';

import { Divider, Switch } from '@nextui-org/react';
import React, { useCallback, useEffect } from 'react';
import { useToggle } from 'react-use';

import IconBatch from '@mimir-wallet/assets/svg/icon-batch.svg?react';
import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import { useBatchTxs } from '@mimir-wallet/hooks';

import Alert from '../Alert';
import Button from '../Button';
import ButtonEnable from '../ButtonEnable';
import AddressChain from './AddressChain';
import BalanceChange from './BalanceChange';
import CustomNonce from './CustomNonce';
import Interact from './Interact';
import SafetyCheck from './SafetyCheck';
import Sender from './Sender';
import TxDetails from './TxDetails';
import { useSafeTx } from './useSafeTx';

function SafeTxModal<Approve extends boolean, Cancel extends boolean>(props: UseSafeTx<Approve, Cancel>) {
  const { website } = props;
  const {
    isApprove,
    isCancel,
    hasSameTx,
    onClose,
    signatures,
    handleSign,
    handleExecute,
    handleSignAndExecute,
    multisig,
    filterPaths,
    address,
    tx,
    safeTx,
    setCustomNonce,
    addressChain,
    simulation,
    setAddressChain,
    executable,
    isSignatureReady,
    isNextSignatureReady
  } = useSafeTx(props);
  const [signOnly, toggleSignOnly] = useToggle(true);
  const [txs, addTx] = useBatchTxs(address);

  const handleAddBatch = useCallback(() => {
    addTx({
      ...tx,
      value: tx.value.toString(),
      website,
      id: Math.max(...txs.map((item) => item.id)) + 1
    });
    onClose?.();
  }, [addTx, onClose, tx, txs, website]);

  useEffect(() => {
    window.onbeforeunload = function onbeforeunload() {
      return 'Closing this window will discard your current progress';
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-5'>
        <h4 className='font-bold text-xl'>{isCancel ? 'Reject Transaction' : 'Submit Transaction'}</h4>
        <Button size='sm' isIconOnly variant='light' radius='full' onClick={onClose}>
          <IconClose />
        </Button>
      </div>

      <div className='w-full flex p-5 gap-5 h-safe-tx-modal-height overflow-y-auto bg-background rounded-large shadow-large'>
        <div className='w-[64%] space-y-5 after:block after:h-5'>
          {isCancel ? (
            <>
              <p className='font-bold text-medium'>
                To reject the transaction, a separate rejection transaction will be created to replace the original one.
              </p>
              <p className='font-bold text-medium'>Transaction nonce: {safeTx?.nonce.toString()}</p>
              <p className='font-bold text-medium'>
                {' '}
                You will need to confirm the rejection transaction with your currently connected wallet.
              </p>
              <TxDetails safeTx={safeTx} tx={tx} address={address} />
            </>
          ) : (
            <>
              <Sender address={address} />
              <Interact address={tx.to} />
              <TxDetails safeTx={safeTx} tx={tx} address={address} />
              {simulation.assetChange.length > 0 && (
                <BalanceChange address={address} assetChange={simulation.assetChange} />
              )}
            </>
          )}

          <SafetyCheck simulation={simulation} />
        </div>

        <div className='sticky top-0 self-start w-[36%] h-auto p-5 space-y-5 rounded-large shadow-large'>
          {isSignatureReady ? null : multisig ? (
            <AddressChain
              filterPaths={filterPaths}
              signatures={signatures}
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
            <Alert severity='warning' title='The nonce determines the order of transactions in the queue.' />
          )}

          {isCancel && (
            <Alert
              severity='warning'
              title={`This transaction is to reject transaction with nonce: ${safeTx?.nonce.toString()}`}
            />
          )}

          <div className='flex gap-2.5'>
            {isSignatureReady ? (
              <ButtonEnable
                isToastError
                onClick={handleExecute}
                color='primary'
                fullWidth
                radius='full'
                disabled={!safeTx || !executable}
                isLoading={simulation.isPending}
              >
                Execute
              </ButtonEnable>
            ) : !signOnly ? (
              <ButtonEnable
                isToastError
                onClick={handleSignAndExecute}
                color='primary'
                fullWidth
                radius='full'
                disabled={!safeTx || (!isApprove && hasSameTx) || !executable}
                isLoading={simulation.isPending}
              >
                Sign & Execute
              </ButtonEnable>
            ) : (
              <ButtonEnable
                isToastError
                onClick={handleSign}
                color='primary'
                fullWidth
                radius='full'
                disabled={!safeTx || (!isApprove && hasSameTx)}
                isLoading={simulation.isPending}
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
              Add To Batch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo<typeof SafeTxModal>(SafeTxModal) as typeof SafeTxModal;
