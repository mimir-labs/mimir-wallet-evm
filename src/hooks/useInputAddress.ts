// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';
import { type Address, isAddress } from 'viem';

export function useInputAddress(
  defaultAddress?: Address
): [
  [address: string, isValidAddress: boolean],
  setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void
] {
  const [value, setValue] = useState<[string, boolean]>([
    defaultAddress || '',
    defaultAddress ? isAddress(defaultAddress) : false
  ]);

  const onChange = useCallback((_value: string | React.ChangeEvent<HTMLInputElement>) => {
    if (typeof _value === 'string') {
      setValue([_value, _value ? isAddress(_value, { strict: false }) : true]);
    } else {
      setValue([_value.target.value, _value.target.value ? isAddress(_value.target.value, { strict: false }) : true]);
    }
  }, []);

  return [value, onChange];
}
