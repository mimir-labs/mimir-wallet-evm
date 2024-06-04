// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input as NextInput, InputProps } from '@nextui-org/react';
import React, { forwardRef } from 'react';

import { EmptyArray } from '@mimir-wallet/constants';

const Input = forwardRef((props: InputProps, ref: React.Ref<HTMLInputElement>) => {
  return (
    <NextInput
      {...props}
      ref={ref}
      disabled={props.disabled}
      classNames={{
        ...props.classNames,
        inputWrapper: [
          'shadow-none',
          'border-default-200',
          'data-[hover=true]:border-primary',
          'data-[hover=true]:bg-primary-50',
          'group-data-[focus=true]:border-primary',
          'group-data-[focus=true]:bg-transparent',
          'group-data-[focus=true]:bg-transparent',
          ...(props.disabled ? ['bg-secondary'] : EmptyArray),
          ...(props.color
            ? [`data-[hover=true]:border-${props.color}`, `group-data-[focus=true]:border-${props.color}`]
            : []),
          ...(props.classNames?.inputWrapper || EmptyArray)
        ],
        input: ['placeholder:text-default-500', ...(props.classNames?.input || EmptyArray)],
        label: ['font-bold', ...(props.classNames?.label || EmptyArray)]
      }}
    />
  );
});

export default React.memo(Input);
