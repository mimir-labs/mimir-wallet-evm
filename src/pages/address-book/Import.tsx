// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { parse } from 'papaparse';
import { useRef } from 'react';
import { getAddress, isAddress } from 'viem';

import IconDownload from '@mimir-wallet/assets/svg/icon-download.svg?react';
import { Button } from '@mimir-wallet/components';
import { toastError, toastSuccess } from '@mimir-wallet/components/ToastRoot';
import { ADDRESS_BOOK_KEY } from '@mimir-wallet/constants';
import { addressEq, store } from '@mimir-wallet/utils';

function Import() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const csvData = e.target?.result;

      if (typeof csvData === 'string') {
        parse(csvData, {
          complete: (results) => {
            if (results.errors.length > 0) {
              toastError(`Import failed: ${results.errors?.[0]?.message || 'Unknown error'}`);

              return;
            }

            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];

            const parsedData = rows
              .map((row) => {
                const item: Record<string, string> = {};

                headers.forEach((header, index) => {
                  item[header] = row[index];
                });

                if (item.address && item.name && item.chainId && isAddress(item.address)) {
                  return [item.address, item.name, item.chainId];
                }

                return null;
              })
              .filter((item): item is [string, string, string] => item !== null);

            const list = (store.get(ADDRESS_BOOK_KEY) || []) as {
              address: Address;
              chainId: number;
              name: string;
            }[];

            parsedData.forEach(([address, name, chainId]) => {
              const existIndex = list.findIndex(
                (item) => item.chainId === Number(chainId) && addressEq(item.address, address)
              );

              if (existIndex !== -1) {
                list[existIndex] = { address: getAddress(address), chainId: Number(chainId), name };
              } else {
                list.push({ address: getAddress(address), chainId: Number(chainId), name });
              }
            });

            store.set(ADDRESS_BOOK_KEY, list);

            toastSuccess('Import successful');
          },
          error: (error: Error) => {
            toastError(`Import failed: ${error?.message || 'Unknown error'}`);
          },
          header: false,
          skipEmptyLines: true
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <Button
      color='primary'
      variant='bordered'
      radius='full'
      startContent={<IconDownload />}
      onClick={handleButtonClick}
    >
      Import
      <input type='file' accept='.csv' hidden onChange={handleImport} ref={fileInputRef} />
    </Button>
  );
}

export default Import;
