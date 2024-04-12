// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

import { isValidInteger, isValidNumber } from '@mimir-wallet/utils';

export function useInputNumber(
  defaultValue?: string,
  integer: boolean = false
): [[address: string, isValidAddress: boolean], setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void, setValid: (valid: boolean) => void] {
  const [value, setValue] = useState<[string, boolean]>([defaultValue?.toString() || '', true]);

  const onChange = useCallback(
    (_value: string | React.ChangeEvent<HTMLInputElement>) => {
      let v: string;

      if (typeof _value === 'string') {
        v = _value;
      } else {
        v = _value.target.value;
      }

      v = v ? Number(v).toString() : v;

      if (integer && v.includes('.')) {
        v = parseInt(v, 10).toString();
      }

      setValue([v, v ? (integer ? isValidInteger(v) : isValidNumber(v)) : true]);
    },
    [integer]
  );

  return [value, onChange, (valid) => setValue(([address]) => [address, valid])];
}
