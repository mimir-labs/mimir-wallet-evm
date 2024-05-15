// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import React from 'react';
import { useNavigate } from 'react-router-dom';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressRow, SafeTxButton } from '@mimir-wallet/components';
import { ONE_DAY } from '@mimir-wallet/constants';
import { buildDeleteDelayModule } from '@mimir-wallet/safe';

function Row({
  safeAccount,
  address,
  module,
  expiration,
  cooldown
}: {
  safeAccount: Address;
  address: Address;
  module: Address;
  expiration: bigint;
  cooldown: bigint;
}) {
  const navigate = useNavigate();

  return (
    <>
      <div className='col-span-3'>
        <AddressRow iconSize={20} address={module} />
      </div>
      <div className='col-span-3'>{Number(cooldown) / ONE_DAY} Days</div>
      <div className='col-span-3'>{Number(expiration) / ONE_DAY} Days</div>
      <div className='col-span-1'>
        <SafeTxButton
          website='mimir://internal/recovery'
          isApprove={false}
          isCancel={false}
          address={safeAccount}
          buildTx={(_, client) => buildDeleteDelayModule(client, safeAccount, address, module)}
          onSuccess={() => navigate('/transactions')}
          isToastError
          isIconOnly
          color='danger'
          size='tiny'
          variant='light'
        >
          <IconDelete />
        </SafeTxButton>
      </div>
    </>
  );
}

function Recoverer({
  data,
  safeAccount
}: {
  safeAccount: Address;
  data: {
    address: Address;
    modules: Address[];
    expiration: bigint;
    cooldown: bigint;
  }[];
}) {
  return (
    <div className='grid grid-cols-10 gap-2.5'>
      <div className='col-span-3 text-default-300'>Recoverer</div>
      <div className='col-span-3 text-default-300'>Review Window</div>
      <div className='col-span-4 text-default-300'>Proposal Expiry</div>
      {data.map((item, index) => (
        <React.Fragment key={index}>
          {item.modules.map((module) => (
            <Row key={`${item.address}-${module}`} safeAccount={safeAccount} {...item} module={module} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

export default React.memo(Recoverer);
