// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import React from 'react';

import Information from './Information';
import SetupMember from './SetupMember';
import SetupName from './SetupName';

function Setup({ safeAddress, multisig }: { safeAddress?: Address; multisig?: Multisig }) {
  return (
    <div className='space-y-5'>
      <SetupName multisig={multisig} key={`setname-${multisig?.address || 'none'}`} />
      <SetupMember multisig={multisig} key={`setmember-${multisig?.address || 'none'}`} />
      <Information safeAddress={safeAddress} />
    </div>
  );
}

export default React.memo(Setup);
