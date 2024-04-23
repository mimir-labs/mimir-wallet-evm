// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { decodeFunctionData, getAbiItem, Hex, size } from 'viem';

import { abis } from '@mimir-wallet/abis';

function FunctionName({ data }: { data: Hex }) {
  const [node, setNode] = useState<React.ReactNode>();

  useEffect(() => {
    try {
      if (size(data) === 0) {
        setNode('Send');

        return;
      }

      const abiItem = getAbiItem({ abi: Object.values(abis).flat(), name: data.slice(0, 10) as Hex });

      const { functionName } = decodeFunctionData({
        abi: [abiItem],
        data
      });

      setNode(functionName);
    } catch (err) {
      setNode(data.slice(0, 10));
    }
  }, [data]);

  return node;
}

export default React.memo(FunctionName);
