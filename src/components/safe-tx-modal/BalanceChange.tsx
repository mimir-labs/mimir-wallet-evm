// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address } from 'abitype';

import IconReceive from '@mimir-wallet/assets/svg/icon-receive.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send.svg?react';
import { useToken } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

import AddressIcon from '../AddressIcon';
import FormatBalance from '../FormatBalance';
import { AssetChange } from './types';

function BalanceFormat({ amount, address }: { amount: bigint; address: Address }) {
  const meta = useToken(address);

  return (
    <span>
      <FormatBalance prefix={<AddressIcon size={18} isToken address={address} />} value={amount} showSymbol {...meta} />
    </span>
  );
}

function BalanceChange({ assetChange, address }: { assetChange: AssetChange[]; address: Address }) {
  return (
    <div className='space-y-1.5'>
      <h6 className='font-bold text-small'>Balance Change</h6>
      {assetChange.map((item, index) => (
        <div
          key={index}
          className='flex justify-between items-center font-bold text-tiny bg-secondary rounded-small p-2.5'
        >
          <div className='flex items-center gap-x-1'>
            {addressEq(item.to, address) ? 'Receive' : 'Send'}
            {addressEq(item.to, address) ? (
              <IconReceive className='text-success' />
            ) : (
              <IconSend className='text-danger' />
            )}
          </div>
          <BalanceFormat amount={item.amount} address={item.tokenAddress} />
        </div>
      ))}
    </div>
  );
}

export default BalanceChange;
