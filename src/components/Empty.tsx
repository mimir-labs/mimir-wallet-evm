// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NullImg from '@mimir-wallet/assets/images/Null.png';

function Empty({ height, label }: { label?: string; height: number | string }) {
  return (
    <div style={{ height }} className='flex items-center justify-center flex-col gap-2.5'>
      <img alt='null' src={NullImg} width={100} />
      <h4 className='font-bold text-medium'>{label || 'No data here.'}</h4>
    </div>
  );
}

export default Empty;
