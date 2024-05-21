// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseSafeTx } from './types';

import { Divider, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from '@nextui-org/react';
import React from 'react';
import { useToggle } from 'react-use';

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

function ItemWrapper({ children }: { children: React.ReactNode }) {
  return <div className='border-1 border-divider rounded-medium p-2.5'>{children}</div>;
}

function SafeTxModal<Approve extends boolean, Cancel extends boolean>(props: UseSafeTx<Approve, Cancel>) {
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

  return (
    <ModalContent>
      <ModalHeader className='px-3'>
        <h6 className='font-bold text-xl'>Submit Transaction</h6>
      </ModalHeader>
      <Divider />
      <ModalBody className='space-y-2.5 px-3'>
        <ItemWrapper>
          <Sender address={address} />
        </ItemWrapper>
        <ItemWrapper>
          <Interact address={tx.to} />
        </ItemWrapper>
        <ItemWrapper>
          <TxDetails safeTx={safeTx} tx={tx} address={address} />
        </ItemWrapper>
        {simulation.assetChange.length > 0 && (
          <ItemWrapper>
            <BalanceChange address={address} assetChange={simulation.assetChange} />
          </ItemWrapper>
        )}
        <ItemWrapper>
          <SafetyCheck simulation={simulation} />
        </ItemWrapper>
        {isSignatureReady ? null : multisig ? (
          <ItemWrapper>
            <AddressChain
              filterPaths={filterPaths}
              signatures={signatures}
              addressChain={addressChain}
              setAddressChain={setAddressChain}
              deep={0}
              multisig={multisig}
            />
          </ItemWrapper>
        ) : null}
        <ItemWrapper>
          <CustomNonce
            safeTx={safeTx}
            address={address}
            isApprove={isApprove}
            isCancel={isCancel}
            setCustomNonce={setCustomNonce}
          />
        </ItemWrapper>
        {isNextSignatureReady && (
          <ItemWrapper>
            <div className='flex justify-between items-center'>
              <b className='text-small'>Sign Only</b>
              <Switch size='sm' checked={signOnly} onChange={toggleSignOnly} />
            </div>
          </ItemWrapper>
        )}
      </ModalBody>
      <Divider />
      <ModalFooter className='flex-col gap-2.5 px-3'>
        {!isApprove && hasSameTx && (
          <Alert severity='warning' title='The nonce determines the order of transactions in the queue.' />
        )}
        <div className='flex gap-2.5'>
          <Button variant='bordered' color='primary' onClick={onClose} radius='full' fullWidth>
            Cancel
          </Button>
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
      </ModalFooter>
    </ModalContent>
  );
}

export default React.memo<typeof SafeTxModal>(SafeTxModal) as typeof SafeTxModal;
