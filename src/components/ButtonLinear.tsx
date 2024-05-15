// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from './types';

import React from 'react';

import Button from './Button';

function ButtonLinear({ className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      variant='solid'
      className={(className || '').concat(' bg-gradient-to-r from-[#0194FF] to-[#D306FF] text-white border-none')}
    />
  );
}

export default React.memo(ButtonLinear);
