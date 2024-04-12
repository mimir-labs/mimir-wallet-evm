// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input as NextInput, InputProps } from '@nextui-org/react';
import React from 'react';

function Input({ ...props }: InputProps): React.ReactElement {
  return (
    <NextInput
      {...props}
      classNames={{
        ...props.classNames,
        inputWrapper: [
          'shadow-none',
          'border-default-200',
          'data-[hover=true]:border-primary',
          'data-[hover=true]:bg-primary-50',
          'group-data-[focus=true]:border-primary',
          'group-data-[focus=true]:bg-transparent',
          ...(props.color ? [`data-[hover=true]:border-${props.color}`, `group-data-[focus=true]:border-${props.color}`] : []),
          ...(props.classNames?.inputWrapper || [])
        ],
        input: ['placeholder:text-default-500', ...(props.classNames?.input || [])],
        label: ['font-bold', ...(props.classNames?.label || [])]
      }}
    />
  );
}

export default React.memo(Input);
