// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import type { InputAddressProps } from './types';

import { Listbox, ListboxItem } from '@nextui-org/react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';
import { Address as AddressType, getAddress, isAddress } from 'viem';

import IconWarning from '@mimir-wallet/assets/svg/icon-warning-fill.svg?react';
import { useInputAddress } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

import Address from './Address';
import AddressCell from './AddressCell';
import AddressIcon from './AddressIcon';
import AddressName from './AddressName';

function InputAddress({ disabled, value, defaultValue, filtered, isSign = false, label, onChange }: InputAddressProps) {
  const isControlled = useRef(value !== undefined);
  const { all, addresses, isMultisig, isSigner, addAddressBook } = useContext(AddressContext);
  const [[inputValue, isValidAddress], setInputValue] = useInputAddress();
  const [selectedKey, setSelectedKey] = useState<string | undefined>(value || defaultValue || '');
  const [isOpen, toggleOpen] = useToggle(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(
    () =>
      Array.from(
        new Set(
          all
            .filter((item) => {
              return (
                (isSign ? isMultisig(item) || isSigner(item) : true) &&
                (inputValue && inputValue !== selectedKey
                  ? item.toLowerCase().includes(inputValue.toLowerCase())
                  : true) &&
                (filtered ? filtered.find((_filter) => _filter.toLowerCase() === item.toLowerCase()) : true)
              );
            })
            .concat(!isSign && inputValue && isValidAddress ? (inputValue as AddressType) : [])
        )
      ),
    [all, filtered, inputValue, isMultisig, isSign, isSigner, isValidAddress, selectedKey]
  );

  useEffect(() => {
    if (isControlled.current && value) {
      setSelectedKey(value);
    }
  }, [setInputValue, value]);

  useEffect(() => {
    const key = selectedKey || '';

    if (isAddress(key)) {
      onChange?.(getAddress(key));
    }
  }, [selectedKey, onChange]);

  const handleSelect = (item: string) => {
    setSelectedKey(item);
    setInputValue('');
    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = (e: React.FocusEvent<HTMLDivElement, Element>) => {
    if (!e.relatedTarget || !wrapperRef.current?.contains(e.relatedTarget)) {
      toggleOpen(false);
      if (!isSign && isValidAddress) handleSelect(inputValue);
    }
  };

  const element = (
    <div className='address-cell inline-flex items-center gap-x-2.5 flex-grow-0'>
      <AddressIcon size={30} address={selectedKey} />
      {selectedKey && !isOpen ? (
        <div className='address-cell-content flex flex-col gap-y-1'>
          <div className='inline font-bold text-sm leading-[16px] h-[16px] max-h-[16px] truncate max-w-[90px]'>
            <AddressName address={selectedKey} />
          </div>
          <div className='inline-flex items-center gap-1 text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal opacity-50'>
            <Address address={selectedKey} showFull />
          </div>
        </div>
      ) : null}
    </div>
  );

  const popoverContent = isOpen ? (
    <div className='z-50 bg-white shadow-medium absolute top-full left-0 right-0 max-h-[250px] mt-2 rounded-medium overflow-y-scroll'>
      <Listbox emptyContent='no addresses'>
        {items.map((item) => (
          <ListboxItem key={item} onClick={() => handleSelect(item)}>
            <AddressCell address={item} showFull />
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      data-disabled={disabled}
      className='input-address-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none'
    >
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
      {!isSign && selectedKey && !addresses.find((item) => addressEq(item, selectedKey)) && (
        <span className='flex items-center gap-1 text-small'>
          <IconWarning className='text-warning' />
          This is an unknown address. You can&nbsp;
          <span
            className='cursor-pointer text-primary'
            onClick={() => {
              addAddressBook([selectedKey as AddressType, '']);
            }}
          >
            add it to your address book
          </span>
        </span>
      )}
    </div>
  );
}

export default React.memo(InputAddress);
