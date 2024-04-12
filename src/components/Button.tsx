// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button as NextButton, ButtonProps } from '@nextui-org/react';
import React from 'react';

function Button({ className, disabled, ...props }: ButtonProps) {
  return <NextButton {...props} disabled={disabled} className={(className || '').concat(`${disabled ? ' opacity-disabled pointer-events-none' : ''} border-1 font-bold`)} />;
}

export default React.memo(Button);
