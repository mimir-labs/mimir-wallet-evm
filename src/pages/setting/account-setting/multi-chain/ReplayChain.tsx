// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { EnableClickHandler } from '@mimir-wallet/components/types';

import { Avatar, Divider, Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/react';
import React, { useCallback, useContext } from 'react';
import { useToggle } from 'react-use';
import { decodeAbiParameters, type Hex } from 'viem';

import LogoCircle from '@mimir-wallet/assets/images/logo-circle.png';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import { Alert, Button, ButtonEnable, CongratsAnimation, TxError } from '@mimir-wallet/components';
import { toastError } from '@mimir-wallet/components/ToastRoot';
import { type CustomChain, deployments } from '@mimir-wallet/config';
import { useCreateMultisig } from '@mimir-wallet/pages/create-multisig/useCreateMultisig';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

interface Props {
  name: string;
  expectedAddress: Address;
  chain: CustomChain;
  factory: Address;
  singleton: Address;
  data: Hex;
  deployedChainIds: number[];
}

function ReplayChain({ name, expectedAddress, chain, deployedChainIds, factory, singleton, data }: Props) {
  const { addMultisig, switchAddress } = useContext(AddressContext);
  const hasSingleton =
    !!deployments[chain.id]?.SafeL2.includes(singleton) || !!deployments[chain.id]?.Safe.includes(singleton);
  const hasFactory = !!deployments[chain.id]?.SafeProxyFactory.includes(factory);
  const [isOpen, toggleOpen] = useToggle(false);
  const [state, start, reset] = useCreateMultisig(name || '');

  const handleClick = useCallback<EnableClickHandler>(
    async (wallet, client) => {
      try {
        const result = await client.call({
          to: factory,
          data
        });

        const [address] = decodeAbiParameters([{ type: 'address' }], result.data || '0x');

        if (addressEq(address, expectedAddress)) {
          start(client, wallet, { type: 'data', to: factory, data });
          toggleOpen(true);
        } else {
          throw new Error('Address not right when simulate');
        }
      } catch (error) {
        toastError(error);
      }
    },
    [data, expectedAddress, factory, start, toggleOpen]
  );

  const { result, title, steps, error } = state;

  return (
    <>
      <div className='py-1 flex items-center justify-between gap-1.5'>
        <Avatar style={{ width: 20, height: 20 }} src={chain.iconUrl} />
        <p className='flex-grow-[1]'>{chain.name}</p>
        {deployedChainIds.includes(chain.id) ? (
          <IconSuccess className='text-success' />
        ) : hasSingleton && hasFactory ? (
          <ButtonEnable
            chainId={chain.id}
            withConnect
            color='primary'
            size='sm'
            variant='bordered'
            radius='full'
            onClick={handleClick}
          >
            Deploy
          </ButtonEnable>
        ) : (
          <span>Comming soon</span>
        )}
      </div>

      <Modal
        placement='auto'
        size='md'
        isOpen={isOpen}
        hideCloseButton={state.isLoading}
        onClose={
          state.isLoading
            ? undefined
            : () => {
                toggleOpen(false);
                reset();
              }
        }
      >
        <ModalContent>
          <ModalBody className='flex flex-col items-center gap-5 py-10'>
            {result ? <CongratsAnimation /> : <img src={LogoCircle} className='w-[70px]' alt='mimir' />}
            <h4 className='font-extrabold text-xl'>{title}</h4>
            {error ? <Alert severity='error' title={<TxError error={error} />} /> : null}
            {steps.map(([key, element]) => (
              <React.Fragment key={key}>{element}</React.Fragment>
            ))}
          </ModalBody>
          <Divider />
          <ModalFooter className='justify-center'>
            {result ? (
              <Button
                onClick={() => {
                  toggleOpen(false);
                  addMultisig(chain.id, result);
                  switchAddress(chain.id, result.address, '/');
                }}
                color='primary'
                radius='full'
              >
                Start Using
              </Button>
            ) : (
              <ButtonEnable
                chainId={chain.id}
                onClick={(wallet, client) => {
                  start(client, wallet, { type: 'data', to: factory, data });
                }}
                disabled={state.isLoading}
                color='primary'
                radius='full'
              >
                {state.isLoading ? 'Progressing...' : 'Retry'}
              </ButtonEnable>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(ReplayChain);
