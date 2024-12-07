// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Papa from 'papaparse';
import { type Address, isAddress } from 'viem';

import { isValidNumber } from '@mimir-wallet/utils';

export function parseCsv(
  file: File,
  onDataParsed: (data: [Address, string][]) => void,
  onError?: (error: string) => void
) {
  const reader = new FileReader();

  reader.readAsText(file);
  Papa.parse(file, {
    complete: (results) => {
      if (results.errors.length > 0) {
        onError?.(results.errors[0].message);

        return;
      }

      const headers = results.data[0] as string[];
      const rows = results.data.slice(1) as string[][];

      const parsedData = rows.map((row) => {
        const item: Record<string, string> = {};

        headers.forEach((header, index) => {
          item[header] = row[index];
        });

        if (item.address && item.amount && isAddress(item.address) && isValidNumber(item.amount)) {
          return [item.address, item.amount];
        }

        return null;
      });

      onDataParsed(parsedData.filter<[Address, string]>((item): item is [Address, string] => item !== null));
    },
    error: (error) => {
      onError?.(error.message);
    },
    header: false,
    skipEmptyLines: true
  });
}

export function generateExampleCsv() {
  const data = [
    ['address', 'amount'],
    ['0x0000000000000000000000000000000000000000', '0.001'],
    ['0x0000000000000000000000000000000000000001', '0.002'],
    ['0x0000000000000000000000000000000000000002', '0.003']
  ];

  // Convert array to CSV format
  const csvContent = data.map((row) => row.join(',')).join('\n');

  // Create Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'sample.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
