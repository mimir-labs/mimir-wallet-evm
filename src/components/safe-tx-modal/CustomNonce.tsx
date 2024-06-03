// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address, Hex } from 'viem';
import type { SafeTransaction } from '@mimir-wallet/safe/types';

import { CircularProgress, Input, Listbox, ListboxItem, ListboxSection } from '@nextui-org/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { useChainId } from 'wagmi';

import IconRefresh from '@mimir-wallet/assets/svg/icon-refresh.svg?react';
import { useInputNumber, useParseCall, usePendingTransactions, useSafeNonce } from '@mimir-wallet/hooks';

import Button from '../Button';

function FuncionName({ data }: { data: Hex }) {
  const [, parsed] = useParseCall(data);

  return parsed.functionName;
}

function CustomNonce({
  safeTx,
  address,
  isApprove,
  isCancel,
  setCustomNonce
}: {
  safeTx?: SafeTransaction;
  address: Address;
  isApprove: boolean;
  isCancel: boolean;
  setCustomNonce: (value: bigint) => void;
}) {
  const chainId = useChainId();
  const [onChainNonce] = useSafeNonce(address);
  const [[nonce], setNonce] = useInputNumber(undefined, true, 0);
  const [isOpen, toggleOpen] = useToggle(false);
  const [{ current, queue }, isTxFetched, isTxFetching, refetch] = usePendingTransactions(chainId, address);
  const [next, setNext] = useState<bigint>();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const replaceList = useMemo(() => {
    const list = Object.entries(queue);

    if (current) list.unshift([current[0].toString(), current[1]]);

    return list;
  }, [current, queue]);

  useEffect(() => {
    if (!isApprove && !isCancel && onChainNonce !== undefined) {
      const max = Math.max(Number(current?.[0] || onChainNonce), ...Object.keys(queue).map(Number));

      if (!current) {
        setNonce(onChainNonce.toString());
      } else {
        setNonce((max + 1).toString());
      }

      setNext(BigInt(max + 1));
    }
  }, [current, onChainNonce, isApprove, queue, setCustomNonce, setNonce, isCancel]);

  useEffect(() => {
    if (nonce) setCustomNonce(BigInt(nonce));
  }, [nonce, setCustomNonce]);

  const replacedTx = useMemo(() => replaceList.find((item) => item[0] === nonce), [nonce, replaceList]);

  const popoverContent = isOpen ? (
    <div
      ref={menuRef}
      className='z-50 bg-white shadow-large absolute top-full left-0 right-0 rounded-medium overflow-y-scroll'
    >
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
              current && current[0] === onChainNonce ? (
                <p className='text-danger'>
                  Replace <FuncionName data={current[1][0].transaction.data} />{' '}
                  {current[1].length - 1 > 0 ? `and other ${current[1].length - 1}` : ''}
                </p>
              ) : null
            }
          >
            Next Execute
          </ListboxItem>
          {current ? (
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
          ) : (
            <ListboxItem className='hidden' key='hidden' />
          )}
        </ListboxSection>
        <ListboxSection title='Replace existing'>
          {replaceList.map(([nonce, items], index) => (
            <ListboxItem
              key={`${nonce}.${index}`}
              startContent={nonce}
              onClick={() => {
                if (nonce) {
                  setNonce(nonce);
                  toggleOpen(false);
                }
              }}
            >
              <FuncionName data={items[0].transaction.data} />{' '}
              {items.length > 1 ? ` and other ${items.length - 1}` : ''}
            </ListboxItem>
          ))}
        </ListboxSection>
      </Listbox>
    </div>
  ) : null;

  return (
    <div className='relative w-full'>
      <div
        className='inline-flex items-center gap-2'
        onBlur={(e) => {
          if (!menuRef.current?.contains(e.relatedTarget)) {
            handleClose();
          }
        }}
      >
        <Input
          disabled={isApprove || isCancel || (isTxFetching && !isTxFetched)}
          label='Nonce #'
          classNames={{
            base: 'inline-flex w-auto',
            inputWrapper: 'w-20'
          }}
          labelPlacement='outside-left'
          value={isApprove || isCancel ? safeTx?.nonce.toString() || '0' : nonce}
          onFocus={handleOpen}
          onChange={setNonce}
          endContent={
            isApprove || isCancel ? null : isTxFetching ? (
              <CircularProgress size='sm' classNames={{ svg: 'w-4 h-4' }} />
            ) : (
              <Button isIconOnly onClick={() => refetch()} color='primary' size='tiny' variant='light'>
                <IconRefresh style={{ opacity: 0.5 }} />
              </Button>
            )
          }
        />
        {!isApprove && replacedTx && (
          <p className='font-bold text-small text-danger'>
            Replace transaction # {nonce}
            {replacedTx[1].length > 1 ? ` and other ${replacedTx[1].length - 1}` : ''}
          </p>
        )}
        {popoverContent}
      </div>
    </div>
  );
}

export default React.memo(CustomNonce);
