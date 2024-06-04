// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Divider, Link, Switch } from '@nextui-org/react';
import React from 'react';

import { ENABLE_EIP_3770_KEY } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks';

function Appearance() {
  const [enableEip3770, setEnableEip3770] = useLocalStore(ENABLE_EIP_3770_KEY, false);

  return (
    <div className='space-y-5'>
      <Card>
        <CardBody className='p-5 space-y-5'>
          <h6 className='text-small font-bold'>Chain-specific addresses</h6>
          <p className='text-tiny'>
            Choose whether to copy{' '}
            <Link className='text-tiny' showAnchorIcon href='https://eips.ethereum.org/EIPS/eip-3770' isExternal>
              EIP-3770
            </Link>{' '}
            prefixes when copying Ethereum addresses
          </p>
          <Divider />
          <div className='flex items-center justify-between text-small'>
            <span>Copy addresses with chain prefix</span>
            <Switch size='sm' isSelected={enableEip3770} onValueChange={setEnableEip3770} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(Appearance);
