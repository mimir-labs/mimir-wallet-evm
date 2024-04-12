// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}

function Cell({ icon, title, description }: Props) {
  return (
    <div className='flex gap-2.5 items-center w-full'>
      {icon}
      <div className='flex flex-col gap-1'>
        <div className='font-bold text-sm'>{title}</div>
        {description ? <div className='text-tiny'>{description}</div> : null}
      </div>
    </div>
  );
}

export default React.memo(Cell);
