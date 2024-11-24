// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Link } from '@nextui-org/react';
import React from 'react';

import IconSet from '@mimir-wallet/assets/svg/icon-set.svg?react';
import { AddressOverview, Button } from '@mimir-wallet/components';
import { useMediaQuery } from '@mimir-wallet/hooks';
import { BaseAccount } from '@mimir-wallet/safe/types';

function Member({ safeAccount }: { safeAccount?: BaseAccount | null }) {
  const upSm = useMediaQuery('sm');

  return (
    <Card>
      <CardBody className='relative w-full h-[calc(100dvh-430px)] p-4'>
        <div className='flex flex-row-reverse items-center gap-2'>
          {safeAccount?.type === 'safe' && (
            <Button as={Link} href='/setting?tab=account' size='sm' color='primary' variant='bordered' radius='full'>
              <IconSet />
            </Button>
          )}
        </div>
        {safeAccount && <AddressOverview key={safeAccount.address} account={safeAccount} showMiniMap={upSm} />}
      </CardBody>
    </Card>
  );
}

export default React.memo(Member);
