// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';

import dayjs from 'dayjs';
import { unparse } from 'papaparse';
import { getAddress } from 'viem';

import IconDownload from '@mimir-wallet/assets/svg/icon-download.svg?react';
import { Button } from '@mimir-wallet/components';
import { ADDRESS_BOOK_KEY } from '@mimir-wallet/constants';
import { store } from '@mimir-wallet/utils';

function Export() {
  const handleExport = () => {
    const values = (store.get(ADDRESS_BOOK_KEY) || []) as {
      address: Address;
      chainId: number;
      name: string;
    }[];

    const data: string[][] = [
      ['address', 'name', 'chainId'],
      ...values.map((address) => [getAddress(address.address), address.name || '', address.chainId.toString()])
    ];
    const csv = unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `mimir-address-book-${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button
      color='primary'
      variant='bordered'
      radius='full'
      startContent={<IconDownload className='rotate-180' />}
      onClick={handleExport}
    >
      Export
    </Button>
  );
}

export default Export;
