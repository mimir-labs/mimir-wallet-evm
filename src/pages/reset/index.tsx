// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { isAddress } from 'viem';

import { useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import ResetMember from './Reset';

function Reset() {
  const { current } = useContext(AddressContext);
  const account = useQueryAccount(current);
  const { delayAddress } = useParams<'delayAddress'>();

  if (!account || account.type !== 'safe' || !delayAddress || !isAddress(delayAddress)) {
    return null;
  }

  return (
    <div className='max-w-lg mx-auto'>
      <ResetMember
        delayAddress={delayAddress}
        threshold={account.threshold || 1}
        members={account.members?.map((item) => item.address) || []}
        safeAddress={account.address}
      />
    </div>
  );
}

export default Reset;
