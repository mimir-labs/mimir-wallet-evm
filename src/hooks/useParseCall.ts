// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallFunctions, ParsedCall } from './types';

import { useEffect, useMemo, useState } from 'react';
import { decodeFunctionData, getAbiItem, type Hex, size } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { decodeMultisend } from '@mimir-wallet/safe';

const cache = new Map<Hex, [size: number, parsed: ParsedCall<CallFunctions>]>();

export function useParseCall(data: Hex): [size: number, parsed: ParsedCall<CallFunctions>] {
  const [state, setState] = useState<[size: number, parsed: ParsedCall<CallFunctions>]>(
    cache.get(data) || [
      0,
      { functionName: 'Send', args: [], names: [], types: [] } as unknown as ParsedCall<CallFunctions>
    ]
  );

  useEffect(() => {
    if (cache.has(data)) {
      setState(cache.get(data)!);
    } else {
      try {
        const dataSize = size(data);

        if (dataSize > 0) {
          const abiItem = getAbiItem({ abi: Object.values(abis).flat(), name: data.slice(0, 10) as Hex });

          if (abiItem && abiItem.type === 'function') {
            const { functionName, args } = decodeFunctionData({
              data,
              abi: [abiItem]
            });

            const _state = [
              dataSize,
              {
                functionName,
                args: args || [],
                names: abiItem.inputs.map((item) => item.name),
                types: abiItem.inputs.map((item) => item.type)
              } as ParsedCall<CallFunctions>
            ];

            cache.set(data, _state as [size: number, parsed: ParsedCall<CallFunctions>]);
            setState(_state as [size: number, parsed: ParsedCall<CallFunctions>]);
          } else {
            setState((state) => [dataSize, state[1]]);
          }
        }
      } catch {
        /* empty */
      }
    }
  }, [data]);

  return state;
}

export function useParseMultisend(parsed: ParsedCall<CallFunctions>) {
  return useMemo(() => {
    if (parsed.functionName === 'multiSend') {
      try {
        return decodeMultisend(parsed.args[0] as Hex);
      } catch {
        /* empty */
      }
    }

    return null;
  }, [parsed.args, parsed.functionName]);
}
