// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hex } from 'viem';

import {
  CircularProgress,
  Input,
  Listbox,
  ListboxItem,
  ListboxSection,
  Modal,
  ModalBody,
  ModalContent
} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { useToggle } from 'react-use';
import { useChainId, useReadContract } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { useInput, useParseCall, usePendingTransactions } from '@mimir-wallet/hooks';

import Button from '../Button';

function FuncionName({ data }: { data: Hex }) {
  const [, parsed] = useParseCall(data);

  return parsed.functionName;
}

function CustomNonce({
  setCustomNonce,
  txNonce,
  isApprove,
  address
}: {
  isApprove: boolean;
  txNonce?: bigint;
  address: Address;
  setCustomNonce: (nonce: bigint) => void;
}) {
  const chainId = useChainId();
  const { data: onChainNonce, isFetching } = useReadContract({
    address,
    abi: abis.SafeL2,
    functionName: 'nonce'
  });
  const [nonce, setNonce] = useInput();
  const [isOpen, toggleOpen] = useToggle(false);
  const [{ current, queue }, , isTxFetching] = usePendingTransactions(chainId, address, onChainNonce);
  const [next, setNext] = useState<bigint>();

  useEffect(() => {
    if (!isApprove && onChainNonce !== undefined) {
      const max = Math.max(Number(current?.[0] || onChainNonce), ...Object.keys(queue).map(Number));

      if (!current) {
        setNonce(onChainNonce.toString());
      } else {
        setNonce((max + 1).toString());
      }

      setNext(BigInt(max + 1));
    }
  }, [current, onChainNonce, isApprove, queue, setCustomNonce, setNonce]);

  useEffect(() => {
    if (nonce) setCustomNonce(BigInt(nonce));
  }, [nonce, setCustomNonce]);

  return (
    <>
      <Input
        disabled={isApprove || isFetching || isTxFetching}
        label='Nonce'
        startContent='#'
        value={isApprove ? txNonce?.toString() || '0' : nonce}
        onChange={setNonce}
        endContent={
          isApprove ? null : isFetching || isTxFetching ? (
            <CircularProgress classNames={{ svg: 'w-6 h-6' }} />
          ) : (
            <Button onClick={toggleOpen} size='sm' variant='light'>
              Recommended
            </Button>
          )
        }
      />
      <Modal isOpen={isOpen} size='xs' onClose={toggleOpen}>
        <ModalContent>
          <ModalBody>
            <Listbox>
              <ListboxSection title='Recommended nonce'>
                <ListboxItem
                  onClick={() => {
                    if (onChainNonce !== undefined) {
                      setNonce(onChainNonce.toString());
                      toggleOpen(false);
                    }
                  }}
                  key='next'
                  startContent={onChainNonce?.toString()}
                  description={
                    current ? (
                      <p className='text-danger'>
                        Replace <FuncionName data={current[1][0].transaction.data} />{' '}
                        {current[1].length - 1 > 0 ? `and other ${current[1].length - 1}` : ''}
                      </p>
                    ) : null
                  }
                >
                  Next Execute
                </ListboxItem>
                <ListboxItem
                  key='order'
                  startContent={next?.toString()}
                  onClick={() => {
                    if (next) {
                      setNonce(next.toString());
                      toggleOpen(false);
                    }
                  }}
                >
                  In Order
                </ListboxItem>
              </ListboxSection>
              <ListboxSection title='Replace existing'>
                {Object.entries(queue).map(([nonce, items]) => (
                  <ListboxItem
                    key={nonce}
                    startContent={nonce}
                    onClick={() => {
                      if (nonce) {
                        setNonce(nonce);
                        toggleOpen(false);
                      }
                    }}
                  >
                    {items.map(({ transaction }) => (
                      <p className='text-small' key={transaction.data}>
                        <FuncionName data={transaction.data} />
                      </p>
                    ))}
                  </ListboxItem>
                ))}
              </ListboxSection>
            </Listbox>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(CustomNonce);
