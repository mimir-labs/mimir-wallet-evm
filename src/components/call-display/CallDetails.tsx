// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Hex } from 'viem';
import type { ParsedCall } from '@mimir-wallet/hooks/types';
import type { MetaTransaction } from '@mimir-wallet/safe/types';

import React from 'react';

import AddressRow from '@mimir-wallet/components/AddressRow';
import Bytes from '@mimir-wallet/components/Bytes';
import FormatBalance from '@mimir-wallet/components/FormatBalance';

function CallDetails({ parsed, multisend }: { parsed: ParsedCall; multisend?: MetaTransaction[] | null }) {
  if (parsed.functionName === 'addOwnerWithThreshold') {
    const { args } = parsed as ParsedCall<'addOwnerWithThreshold'>;

    return <AddressRow iconSize={14} address={args[0]} />;
  }

  if (parsed.functionName === 'changeThreshold') {
    const { args } = parsed as ParsedCall<'changeThreshold'>;

    return args[0].toString();
  }

  if (parsed.functionName === 'swapOwner') {
    const { args } = parsed as ParsedCall<'swapOwner'>;

    return (
      <span className='inline-flex gap-1'>
        <AddressRow iconSize={14} address={args[1]} />
        <span>{'->'}</span>
        <AddressRow iconSize={14} address={args[2]} />
      </span>
    );
  }

  if (parsed.functionName === 'removeOwner') {
    const { args } = parsed as ParsedCall<'removeOwner'>;

    return <AddressRow iconSize={14} address={args[1]} />;
  }

  // TODO: token icon and address
  if (parsed.functionName === 'transferToken') {
    const { args } = parsed as ParsedCall<'transferToken'>;

    return <FormatBalance value={args[2]} />;
  }

  if (parsed.functionName === 'multiSend') {
    const { args } = parsed as ParsedCall<'multiSend'>;

    return multisend ? `${multisend.length} transactions` : <Bytes data={args[0] as Hex} />;
  }

  return '--';
}

export default React.memo(CallDetails);
