// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import React from 'react';

import { useMultisig } from '@mimir-wallet/hooks';

import ButtonEnable from '../ButtonEnable';
import ButtonLinear from '../ButtonLinear';
import ButtonLinearBorder from '../ButtonLinearBorder';
import AddressChain from './AddressChain';
import CustomNonce from './CustomNonce';
import Interact from './Interact';
import SafetyCheck from './SafetyCheck';
import Sender from './Sender';
import TxDetails from './TxDetails';
import { UseSafeTx, useSafeTx } from './useSafeTx';

function SafeTxModal<Approve extends boolean>(props: UseSafeTx<Approve>) {
  const { isApprove, signatures } = props;
  const {
    onClose,
    isSignatureReady,
    executeLoading,
    setCustomNonce,
    handleExecute,
    loading,
    handleClick,
    address,
    safeTx,
    nonce,
    addressChain,
    setAddressChain
  } = useSafeTx(props);
  const multisig = useMultisig(address);

  return (
    <ModalContent>
      <ModalHeader className='px-3'>
        <h6 className='font-bold text-xl'>Submit Transaction</h6>
      </ModalHeader>
      <Divider />
      <ModalBody className='space-y-2.5 px-3'>
        <Sender address={address} />
        <Interact address={safeTx.to} />
        <TxDetails tx={safeTx} nonce={nonce} address={address} />
        <SafetyCheck nonce={nonce} tx={safeTx} address={address} />
        {isSignatureReady ? null : multisig ? (
          <AddressChain
            signatures={signatures}
            addressChain={addressChain}
            setAddressChain={setAddressChain}
            deep={0}
            multisig={multisig}
          />
        ) : null}
        <CustomNonce txNonce={nonce} isApprove={isApprove} address={address} setCustomNonce={setCustomNonce} />
      </ModalBody>
      <Divider />
      <ModalFooter className='gap-2.5 px-3'>
        <ButtonLinearBorder onClick={onClose} radius='full' fullWidth>
          Cancel
        </ButtonLinearBorder>
        {isSignatureReady ? (
          <ButtonEnable
            isLoading={executeLoading}
            onClick={handleExecute}
            Component={ButtonLinear}
            fullWidth
            radius='full'
          >
            Execute
          </ButtonEnable>
        ) : (
          <ButtonEnable isLoading={loading} onClick={handleClick} Component={ButtonLinear} fullWidth radius='full'>
            Sign
          </ButtonEnable>
        )}
      </ModalFooter>
    </ModalContent>
  );
}

export default React.memo(SafeTxModal);
