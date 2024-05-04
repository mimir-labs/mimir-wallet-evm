// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NullImg from '@mimir-wallet/assets/images/empty.webp';

function Empty({ height, label }: { label?: string; height: number | string }) {
  return (
    <div style={{ height }} className='flex items-center justify-center flex-col gap-2.5'>
      <img alt='null' src={NullImg} width={150} />
      <h4 className='text-medium text-foreground/50'>{label || 'No data here.'}</h4>
    </div>
  );
}

export default Empty;
