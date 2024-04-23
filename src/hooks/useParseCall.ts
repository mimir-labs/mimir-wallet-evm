// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallFunctions, ParsedCall } from './types';

import { useMemo } from 'react';
import { decodeFunctionData, getAbiItem, type Hex, size } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { decodeMultisend } from '@mimir-wallet/safe';

export function useParseCall(data: Hex): [size: number, parsed: ParsedCall<CallFunctions>] {
  return useMemo(() => {
    try {
      const dataSize = size(data);

      if (dataSize === 0) {
        return [0, { functionName: 'Send', args: [] } as unknown as ParsedCall<CallFunctions>];
      }

      const abiItem = getAbiItem({ abi: Object.values(abis).flat(), name: data.slice(0, 10) as Hex });

      const { functionName, args } = decodeFunctionData({
        data,
        abi: [abiItem]
      });

      return [dataSize, { functionName, args: args || [] } as ParsedCall<CallFunctions>];
    } catch (e) {
      return [size(data), { functionName: data.slice(0, 10), args: [] } as unknown as ParsedCall<CallFunctions>];
    }
  }, [data]);
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
