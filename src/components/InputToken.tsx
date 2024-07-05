// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import type { InputTokenProps, InputTokenType } from './types';

import { Listbox, ListboxItem, Skeleton } from '@nextui-org/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { Address as AddressType, getAddress, isAddress } from 'viem';

import { useAccountBalance, useInput, useToken } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

import Address from './Address';
import AddressCell from './AddressCell';
import AddressIcon from './AddressIcon';
import FormatBalance from './FormatBalance';

function InputToken({ disabled, value, account, defaultValue, showBalance, tokens, label, onChange }: InputTokenProps) {
  const isControlled = useRef(value !== undefined);
  const [inputValue, setInputValue] = useInput();
  const [selectedKey, setSelectedKey] = useState<string | undefined>(value || defaultValue || '');
  const [isOpen, toggleOpen] = useToggle(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldInputQuery =
    isAddress(inputValue) && tokens.filter((item) => addressEq(item.tokenAddress, inputValue)).length === 0;
  const [inputToken, isFetched, isFetching] = useToken(shouldInputQuery ? inputValue : undefined);

  const [selectedToken] = useAccountBalance(account, selectedKey && isAddress(selectedKey) ? selectedKey : undefined);

  const filterTokens = useMemo(
    () =>
      (
        tokens.filter(
          (item) =>
            item.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            item.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
            addressEq(item.tokenAddress, inputValue)
        ) as Array<Partial<InputTokenType> & { tokenAddress: AddressType }>
      ).concat(
        shouldInputQuery
          ? {
              name: inputToken?.name,
              symbol: inputToken?.symbol,
              decimals: inputToken?.decimals,
              tokenAddress: inputValue,
              isFetched,
              isFetching
            }
          : []
      ),
    [
      inputToken?.decimals,
      inputToken?.name,
      inputToken?.symbol,
      inputValue,
      isFetched,
      isFetching,
      shouldInputQuery,
      tokens
    ]
  );

  const tokenMeta = useMemo(() => {
    return selectedKey ? filterTokens.find((item) => addressEq(item.tokenAddress, selectedKey)) : undefined;
  }, [filterTokens, selectedKey]);

  useEffect(() => {
    if (isControlled.current && value) {
      setSelectedKey(value);
    }
  }, [value]);

  const handleSelect = (item: string) => {
    setSelectedKey(item);
    setInputValue('');
    if (isAddress(item)) onChange?.(getAddress(item));
    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
  };

  const element = (
    <div className='w-full flex items-center justify-between gap-x-2.5 flex-grow-0'>
      <AddressIcon isToken size={30} address={selectedKey} />
      {selectedKey && !isOpen ? (
        <>
          <div className='flex-1 flex flex-col gap-y-1'>
            <div className='inline font-bold text-sm leading-[16px] h-[16px] max-h-[16px] truncate max-w-[90px]'>
              {tokenMeta?.symbol}
            </div>
            <div className='inline-flex items-center gap-1 text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal opacity-50'>
              <Address address={selectedKey} showFull />
            </div>
          </div>
          <b>{showBalance && <FormatBalance {...tokenMeta} {...selectedToken} />}</b>
        </>
      ) : null}
    </div>
  );

  const popoverContent = isOpen ? (
    <div className='z-50 bg-white shadow-medium absolute top-full left-0 right-0 max-h-[300px] mt-2 rounded-medium overflow-y-scroll'>
      <Listbox items={filterTokens}>
        {(item) => (
          <ListboxItem key={item.tokenAddress} onClick={() => handleSelect(item.tokenAddress)}>
            {item.isFetching ? (
              <div className='w-full flex items-center gap-2.5'>
                <div>
                  <Skeleton className='flex rounded-full w-10 h-10' />
                </div>
                <div className='w-full flex flex-col gap-1'>
                  <Skeleton className='h-3 w-3/5 rounded-lg' />
                  <Skeleton className='h-3 w-4/5 rounded-lg' />
                </div>
              </div>
            ) : (
              <AddressCell
                isToken
                icon={item.icon || undefined}
                fallbackName={item.symbol}
                address={item.tokenAddress}
                showFull
                iconSize={24}
                withCopy
              />
            )}
          </ListboxItem>
        )}
      </Listbox>
    </div>
  ) : null;

  return (
    <div data-disabled={disabled} className='input-token-wrapper space-y-2 data-[disabled=true]:pointer-events-none'>
      {label && <div className='font-bold text-small'>{label}</div>}
      <div
        onFocus={handleOpen}
        onBlur={handleClose}
        className='group relative w-full inline-flex tap-highlight-transparent px-2 border-medium min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none h-14 py-2 shadow-none border-default-200 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary data-[focus=true]:bg-transparent'
      >
        {element}
        <input
          ref={inputRef}
          className='absolute rounded-medium top-0 right-0 bottom-0 left-0 outline-none border-none pl-12 bg-transparent'
          style={{ opacity: !isOpen ? 0 : 1 }}
          value={inputValue}
          onChange={setInputValue}
        />
        {popoverContent}
      </div>
    </div>
  );
}

export default React.memo(InputToken);
