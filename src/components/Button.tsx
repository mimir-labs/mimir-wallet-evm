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
        className={`${disabled ? ' opacity-disabled' : ''} border-1 font-bold ${size === 'sm' ? 'min-w-12' : ''}`
          .concat(
            size === 'tiny' ? ' px-2 data-[icon-only=true]:w-5 data-[icon-only=true]:px-0 h-5 min-w-5 min-h-5' : ''
          )
          .concat(' data-[icon-only=true]:min-w-5')
          .concat(` ${className || ''}`)}
      />
    );
  }
);

export default React.memo(Button);
