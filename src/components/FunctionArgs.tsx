// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { decodeFunctionData, getAbiItem, Hex, isHex, size } from 'viem';

import { abis } from '@mimir-wallet/abis';

import AddressRow from './AddressRow';
import Bytes from './Bytes';

function parse(data: unknown): React.ReactNode {
  if (typeof data === 'object') return JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v));

  if (isHex(data)) {
    return <Bytes data={data} />;
  }

  return data?.toString?.() || null;
}

function Item({ label, content }: { label: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className='grid grid-cols-10 text-tiny'>
      <div className='col-span-3 font-bold self-center tex-foreground'>{label}</div>
      <div className='col-span-7 self-center text-foreground/50 max-w-full overflow-hidden text-ellipsis'>
        {content}
      </div>
    </div>
  );
}

function FunctionArgs({ data }: { data: Hex }) {
  const [node, setNode] = useState<React.ReactNode>();

  useEffect(() => {
    try {
      if (size(data) === 0) {
        return;
      }

      const abiItem = getAbiItem({ abi: Object.values(abis).flat(), name: data.slice(0, 10) as Hex });

      const { args } = decodeFunctionData({
        abi: [abiItem],
        data
      });

      if (abiItem) {
        if (abiItem.type === 'function') {
          setNode(
            abiItem.inputs.map((item, index) => (
              <Item
                key={item.name || index.toString()}
                label={item.name || index.toString()}
                content={
                  item.type === 'address' ? (
                    <AddressRow iconSize={14} address={args?.[index]?.toString() as string} />
                  ) : (
                    parse(args?.[index] || '')
                  )
                }
              />
            ))
          );

          return;
        }
      }

      throw new Error('not support');
    } catch (err) {
      setNode(<Item label={data.slice(0, 10)} content={<Bytes data={`0x${data.slice(10)}`} />} />);
    }
  }, [data]);

  return node;
}

export default React.memo(FunctionArgs);
