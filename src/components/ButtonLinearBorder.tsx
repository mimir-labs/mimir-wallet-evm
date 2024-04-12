// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonProps } from '@nextui-org/react';
import React from 'react';

import Button from './Button';

function ButtonLinearBorder({ className, radius, fullWidth, children, ...props }: ButtonProps) {
  return (
    <div
      className={`p-[1px] h-10 rounded-${radius} bg-gradient-to-r from-[#0194FF] to-[#D306FF] text-white has-[button[data-pressed=true]]:scale-[0.97] has-[button[data-pressed=true]]:skew-[0.97] has-[button[data-pressed=true]]:translate-[0.97] transition-transform ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <Button {...props} fullWidth={fullWidth} variant='solid' radius={radius} className={(className || '').concat(' bg-white h-full data-[pressed=true]:transform-none')}>
        <span className='bg-clip-text text-transparent bg-gradient-to-r from-[#0194FF] to-[#D306FF]'>{children}</span>
      </Button>
    </div>
  );
}

export default React.memo(ButtonLinearBorder);
