// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from './types';

import { Button as NextButton } from '@nextui-org/react';
import React, { forwardRef } from 'react';

const Button = forwardRef(
  ({ size, disabled, className, ...props }: ButtonProps, ref: React.Ref<HTMLButtonElement> | undefined) => {
    return (
      <NextButton
        {...props}
        data-icon-only={props.isIconOnly}
        ref={ref}
        size={size === 'tiny' ? 'sm' : size}
        disabled={disabled}
        className={(className || '')
          .concat(
            `${disabled ? ' opacity-disabled pointer-events-none' : ''} border-1 font-bold ${size === 'sm' ? 'min-w-12' : ''}`
          )
          .concat(
            size === 'tiny' ? ' data-[icon-only=true]:w-5 data-[icon-only=true]:px-0 h-5 min-w-5 min-h-5 px-2' : ''
          )
          .concat(' data-[icon-only=true]:min-w-5')}
      />
    );
  }
);

export default React.memo(Button);
