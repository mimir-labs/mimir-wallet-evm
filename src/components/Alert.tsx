// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconWarning from '@mimir-wallet/assets/svg/icon-warning-fill.svg?react';

interface Props {
  variant?: 'fill' | 'text';
  severity?: 'default' | 'success' | 'error' | 'warning';
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'default';
  title: React.ReactNode;
  content?: React.ReactNode;
  size?: 'sm' | 'tiny' | 'medium';
}

function Alert({
  variant = 'fill',
  severity = 'default',
  size = 'sm',
  title,
  content,
  color: propsColor
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
      className={`flex flex-col gap-y-2.5 bg-opacity-10 rounded-medium`.concat(
        variant === 'fill' ? ` bg-${color} p-2.5 data-[size=tiny]:py-1.5` : ' p-0'
      )}
    >
      <div className={`flex gap-x-1 items-center text-${color} text-${size} font-bold`}>
        {severity === 'success' ? (
          <IconSuccess />
        ) : severity === 'error' ? (
          <IconWarning />
        ) : severity === 'warning' ? (
          <IconWarning />
        ) : (
          <IconWarning />
        )}
        <h6>{title}</h6>
      </div>
      {content ? <div className={`text-tiny text-${color} text-opacity-65`}>{content}</div> : null}
    </div>
  );
}

export default React.memo(Alert);
