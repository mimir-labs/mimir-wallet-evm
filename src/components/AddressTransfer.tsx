// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';

import { Card, CardBody } from '@nextui-org/react';
import React, { useEffect, useMemo } from 'react';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';

import AddressRow from './AddressRow';
import Button from './Button';

interface Props {
  addresses: Address[];
  selected: Address[];
  onChange: React.Dispatch<React.SetStateAction<Address[]>>;
}

function Content({ isSelected, title, addresses, onSelect }: { title: string; isSelected?: boolean; onSelect: (value: Address) => void; addresses: Address[] }) {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='font-bold'>{title}</div>
      <Card className='mt-1 border-default-300 border-1 min-h-20 flex-1'>
        <CardBody className='space-y-2 overflow-y-auto max-h-[200px] p-2 flex-1'>
          {addresses.map((address) => (
            <div key={address} className='flex items-center gap-x-1 rounded-small p-1 bg-secondary text-tiny'>
              <AddressRow iconSize={20} address={address} showFull={false} />
              <Button color={isSelected ? 'danger' : 'primary'} onClick={() => onSelect(address)} className='w-5 h-5 min-w-5' size='sm' isIconOnly variant='light'>
                {isSelected ? <IconDelete /> : <IconAdd />}
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function AddressTransfer({ onChange, addresses, selected }: Props) {
  const available = useMemo(() => addresses.filter((item) => !selected.includes(item)), [addresses, selected]);

  useEffect(() => {
    onChange(selected);
  }, [onChange, selected]);

  return (
    <div className='flex justify-between gap-x-2 flex-col items-stretch sm:flex-row'>
      <Content onSelect={(value) => onChange((_selected) => [..._selected, value])} addresses={available} title='Address List' />
      <Content isSelected onSelect={(value) => onChange((_selected) => _selected.filter((item) => item !== value))} title='Members' addresses={selected} />
    </div>
  );
}

export default React.memo(AddressTransfer);
