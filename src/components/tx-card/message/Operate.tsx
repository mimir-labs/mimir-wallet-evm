// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { MessageResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import React, { useContext } from 'react';

import Alert from '@mimir-wallet/components/Alert';
import ButtonEnable from '@mimir-wallet/components/ButtonEnable';
import { useIsReadOnly } from '@mimir-wallet/hooks';
import { SafeTxContext } from '@mimir-wallet/providers';

function Operate({
  account,
  filterPaths,
  message,
  isSignatureReady
}: {
  account: BaseAccount;
  filterPaths: Array<Address[]>;
  message: MessageResponse;
  isSignatureReady: boolean;
}) {
  const isReadOnly = useIsReadOnly(account);
  const { addMessage } = useContext(SafeTxContext);

  return (
    <>
      {filterPaths.length === 0 && !isSignatureReady && !isReadOnly && (
        <Alert variant='text' severity='warning' size='tiny' title='Waiting for other members’ approvement.' />
      )}

      <div className='flex items-center gap-x-2.5'>
        {!isReadOnly && filterPaths.length > 0 && (
          <ButtonEnable
            fullWidth
            radius='full'
            color='primary'
            withConnect
            onClick={() => {
              addMessage({
                address: message.address,
                message: message.mesasge,
                metadata: { website: message.website, iconUrl: message.iconUrl, appName: message.appName }
              });
            }}
          >
            Approve
          </ButtonEnable>
        )}
      </div>
    </>
  );
}

export default React.memo(Operate);
