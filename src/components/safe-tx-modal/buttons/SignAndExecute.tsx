// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount, IPublicClient, IWalletClient, SafeTransaction } from '@mimir-wallet/safe/types';
import type { Simulation } from '../types';

import { Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip } from '@nextui-org/react';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { padHex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import Button from '@mimir-wallet/components/Button';
import ButtonEnable from '@mimir-wallet/components/ButtonEnable';
import { PENDING_SAFE_TX_PREFIX } from '@mimir-wallet/constants';
import { AddressContext } from '@mimir-wallet/providers';
import { buildBytesSignatures, execute, signSafeTransaction } from '@mimir-wallet/safe';
import { addressEq, service, session } from '@mimir-wallet/utils';

import { buildSigTree, findValidSignature } from '../utils';
import { waitTransaction } from '../waitTransaction';

function Item({
  index,
  error,
  title,
  desc,
  isSuccess,
  isWaiting
}: {
  index: number;
  error: Error | null;
  title: string;
  desc: string;
  isSuccess: boolean;
  isWaiting: boolean;
}) {
  return (
    <div
      data-error={!!error}
      data-success={isSuccess}
      data-waiting={isWaiting}
      className={'group flex items-center gap-5'.concat(
        ' text-foreground data-[waiting=true]:text-[#D9D9D9] data-[success=true]:text-foreground data-[error=true]:text-danger'
      )}
    >
      <div className='flex-shrink-0 flex items-center justify-center w-[50px] h-[50px] rounded-full font-bold text-xl text-white bg-primary group-data-[error=true]:bg-danger'>
        {isSuccess ? <IconSuccess width={24} height={24} /> : index}
      </div>
      <div className='flex-1'>
        <h4 className='font-bold text-xl'>{title}</h4>
        <p className='text-small'>{desc}</p>
      </div>
    </div>
  );
}

function SignAndExecute({
  safeAddress,
  safeAccount,
  simulation,
  safeTx,
  addressChain,
  signatures,
  isApprove,
  hasSameTx,
  executable,
  onChainNonce,
  metadata,
  onSuccess,
  refetch
}: {
  safeAddress: Address;
  safeAccount?: BaseAccount | null;
  simulation: Simulation;
  safeTx?: SafeTransaction;
  addressChain: Address[];
  signatures: SignatureResponse[];
  isApprove: boolean;
  hasSameTx: boolean;
  executable: boolean;
  onChainNonce?: bigint;
  metadata?: {
    website?: string;
    iconUrl?: string;
    appName?: string;
  };
  refetch: () => void;
  onSuccess?: (safeTx: SafeTransaction) => void;
}) {
  const { isSigner } = useContext(AddressContext);
  const chainId = useChainId();
  const [isOpen, toggleOpen] = useToggle(false);
  const [errors, setErrors] = useState<[Error | null, Error | null]>([null, null]);
  const [showRetry, setShowRetry] = useState(false);
  const finalSignatureRef = useRef<[SignatureResponse[], () => Promise<void>]>();
  const [hasFinalSignature, setHasFinalSignature] = useState(false);
  const { connector } = useAccount();

  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      if (!safeTx || !safeAccount) return;

      const signer = addressChain[addressChain.length - 1];

      if (!signer && !isSigner(addressChain[addressChain.length - 1])) return;

      setErrors([null, null]);
      toggleOpen(true);

      try {
        if (!finalSignatureRef.current) {
          const signature = await signSafeTransaction(wallet, client, safeAddress, safeTx, signer, addressChain);

          const _signatures = JSON.parse(JSON.stringify(signatures));
          let mapSigs: SignatureResponse[] = _signatures;

          for (let i = 0; i < addressChain.length; i++) {
            const address = addressChain[i];

            let sub = mapSigs.find((item) => addressEq(address, item.signature.signer));

            if (!sub) {
              sub = {
                uuid: '',
                isStart: i === addressChain.length - 1,
                createdAt: Date.now(),
                signature: {
                  signer: address,
                  signature:
                    i === addressChain.length - 1
                      ? signature
                      : padHex(padHex(address, { dir: 'left', size: 32 }), { dir: 'right', size: 65 })
                },
                children: []
              };
              mapSigs.push(sub);
            }

            if (!sub.children) {
              sub.children = [];
            }

            mapSigs = sub.children;
          }

          if (!finalSignatureRef.current)
            finalSignatureRef.current = [
              _signatures as SignatureResponse[],
              async () => {
                await service.createTx(
                  wallet.chain.id,
                  safeAddress,
                  signature,
                  signer,
                  safeTx,
                  addressChain,
                  metadata?.website,
                  metadata?.iconUrl,
                  metadata?.appName
                );
              }
            ];
        }
      } catch (error) {
        setErrors([error as Error, null]);
        setShowRetry(true);

        throw error;
      }

      setHasFinalSignature(true);

      try {
        const hash = await execute(
          wallet,
          client,
          safeAddress,
          safeTx,
          buildBytesSignatures(buildSigTree(safeAccount, findValidSignature(safeAccount, finalSignatureRef.current[0])))
        );

        waitTransaction(client, hash);
      } catch (error) {
        setErrors([null, error as Error]);
        setShowRetry(true);

        throw error;
      }

      await finalSignatureRef.current[1]().catch(() => {});

      refetch();
      session.set(`${PENDING_SAFE_TX_PREFIX}${chainId}:${safeAddress}:${safeTx.nonce}`, true);
      onSuccess?.(safeTx);
      toggleOpen(false);
    },
    [
      addressChain,
      chainId,
      isSigner,
      metadata?.appName,
      metadata?.iconUrl,
      metadata?.website,
      onSuccess,
      refetch,
      safeAccount,
      safeAddress,
      safeTx,
      signatures,
      toggleOpen
    ]
  );

  if (onChainNonce !== safeTx?.nonce) {
    <Tooltip showArrow closeDelay={0} content='This transaction is currently in the queue' color='warning'>
      <Button color={simulation.isSuccess ? 'primary' : 'warning'} fullWidth radius='full' disabled>
        {simulation.isSuccess ? 'Sign & Execute' : 'Sign & Execute Anyway'}
      </Button>
    </Tooltip>;
  }

  return (
    <>
      <ButtonEnable
        isToastError
        onClick={handleClick}
        color={simulation.isSuccess ? 'primary' : 'warning'}
        fullWidth
        radius='full'
        disabled={
          !safeTx ||
          (!isApprove && hasSameTx) ||
          !executable ||
          (onChainNonce !== undefined && safeTx.nonce < onChainNonce)
        }
        isLoading={simulation.isPending}
        withConnect
      >
        {simulation.isSuccess ? 'Sign & Execute' : 'Sign & Execute Anyway'}
      </ButtonEnable>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          toggleOpen(false);
          setShowRetry(false);
        }}
      >
        <ModalContent>
          <ModalHeader>Sign and Execute</ModalHeader>
          <Divider />
          <ModalBody className='space-y-5 p-5'>
            <Item
              index={1}
              isSuccess={hasFinalSignature}
              isWaiting={false}
              error={errors[0]}
              title='Sign Approval'
              desc='1 signature needed to reach the threshold'
            />
            <Item
              index={2}
              isSuccess={false}
              isWaiting={!hasFinalSignature}
              error={errors[1]}
              title='Execute'
              desc='Submit transaction on chain'
            />
          </ModalBody>
          <Divider />
          <ModalFooter className='flex-col items-center gap-5'>
            <div className='flex flex-col gap-5'>
              <p className='font-light text-xl'>
                {hasFinalSignature ? (
                  <span>
                    Please Click <b className='font-extrabold'>Sign</b> in {connector?.name || 'Wallet'}.
                  </span>
                ) : (
                  <span>
                    Please Click <b className='font-extrabold'>Approve</b> in {connector?.name || 'Wallet'}
                  </span>
                )}
              </p>
            </div>
            {showRetry && (
              <ButtonEnable isToastError color='primary' onClick={handleClick} radius='full' className='w-[30%]'>
                Retry
              </ButtonEnable>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(SignAndExecute);
