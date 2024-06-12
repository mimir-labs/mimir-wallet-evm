// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconWarning from '@mimir-wallet/assets/svg/icon-warning-fill.svg?react';

interface Props {
  variant?: 'fill' | 'text';
  severity?: 'default' | 'success' | 'error' | 'warning';
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'default';
  title?: React.ReactNode;
  content?: React.ReactNode;
  size?: 'sm' | 'tiny' | 'medium';
  className?: string;
}

function Alert({
  variant = 'fill',
  severity = 'default',
  size = 'sm',
  title,
  content,
  color: propsColor,
  className
}: Props): React.ReactElement {
  const color =
    propsColor ||
    (severity === 'success'
      ? 'success'
      : severity === 'error'
        ? 'danger'
        : severity === 'warning'
          ? 'warning'
          : severity === 'default'
            ? 'default'
            : 'primary');

  return (
    <div
      data-size={size}
      data-variant={variant}
      className={`flex gap-2.5 bg-opacity-10 rounded-medium`
        .concat(variant === 'fill' ? ` bg-${color} p-2.5 data-[size=tiny]:py-1.5` : ' p-0')
        .concat(className ? ` ${className}` : '')}
    >
      <div className={`text-${color}`}>
        {severity === 'success' ? (
          <IconSuccess className='flex-shrink-0' />
        ) : severity === 'error' ? (
          <IconWarning className='flex-shrink-0' />
        ) : severity === 'warning' ? (
          <IconWarning className='flex-shrink-0' />
        ) : (
          <IconWarning className='flex-shrink-0' />
        )}
      </div>
      <div className={`text-${size} text-${color} leading-[16px]`}>
        {title && <h6 className='font-bold'>{title}</h6>}
        {content ? <div className='mt-2.5 text-opacity-65'>{content}</div> : null}
      </div>
    </div>
  );
}

export default React.memo(Alert);
