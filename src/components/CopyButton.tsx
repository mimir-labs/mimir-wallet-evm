// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ButtonProps } from './types';

import React from 'react';

import IconCopy from '@mimir-wallet/assets/svg/icon-copy.svg?react';
import IconCopyColored from '@mimir-wallet/assets/svg/icon-copy-colored.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import { useCopy } from '@mimir-wallet/hooks';

import Button from './Button';

interface Props extends Omit<ButtonProps, 'value'> {
  value?: string | null;
  colored?: boolean;
}

function CopyButton({ value, className, colored, style, ...props }: Props) {
  const [copied, copy] = useCopy(value || '');

  return (
    <Button
      {...props}
      isIconOnly
      variant='light'
      onClick={copy}
      style={style}
      className={className?.concat(' border-transparent')}
    >
      {copied ? <IconSuccess width={14} /> : colored ? <IconCopyColored width={14} /> : <IconCopy width={14} />}
    </Button>
  );
}

export default React.memo(CopyButton);
