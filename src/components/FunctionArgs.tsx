// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { Address, Hex, isHex, zeroAddress } from 'viem';

import { useParseCall } from '@mimir-wallet/hooks';

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

function FunctionArgs({ data, to }: { data: Hex; to?: Address }) {
  const [node, setNode] = useState<React.ReactNode>();
  const [size, parsed] = useParseCall(data);

  useEffect(() => {
    try {
      if (size === 0) {
        return;
      }

      setNode(
        parsed.args.map((item, index) => (
          <Item
            key={parsed.names[index] || index.toString()}
            label={parsed.names[index] || index.toString()}
            content={
              parsed.types[index] === 'address' ? (
                <AddressRow iconSize={14} address={item?.toString()} />
              ) : (
                parse(item || '')
              )
            }
          />
        ))
      );
    } catch {
      /* empty */
    }
  }, [parsed.args, parsed.names, parsed.types, size]);

  return (
    <>
      {to && to !== zeroAddress && (
        <Item
          key={`interact-with-${to}`}
          label='Interact With'
          content={<AddressRow iconSize={14} address={to} withCopy />}
        />
      )}
      {node}
    </>
  );
}

export default React.memo(FunctionArgs);
