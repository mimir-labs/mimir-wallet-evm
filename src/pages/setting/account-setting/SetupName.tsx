// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IWalletClient, Multisig } from '@mimir-wallet/safe/types';

import { Card, CardBody } from '@nextui-org/react';
import React, { useCallback, useContext } from 'react';

import { ButtonEnable, Input } from '@mimir-wallet/components';
import { useInput } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { signChangeName } from '@mimir-wallet/safe';
import { service } from '@mimir-wallet/utils';

function SetupName({ multisig }: { multisig?: Multisig }) {
  const { changeName } = useContext(AddressContext);
  const [name, setName] = useInput(multisig?.name || '');

  const save = useCallback(
    async (wallet: IWalletClient) => {
      if (!multisig) {
        throw new Error(`Not multisig account`);
      }

      if (!name) {
        throw new Error('Please enter new name');
      }

      const signature = await signChangeName(wallet, multisig, name);

      await service.changeName(wallet.chain.id, multisig.address, name, signature);
      await changeName(multisig.address, name);
    },
    [changeName, multisig, name]
  );

  return (
    <div>
      <h6 className='font-bold mb-1 text-medium text-foreground/50'>Name</h6>
      <Card>
        <CardBody className='p-5 space-y-5'>
          <Input
            value={name}
            type='text'
            variant='bordered'
            labelPlacement='outside'
            onChange={setName}
            label='New Name'
            placeholder='Enter name'
            description='All members will see this name'
          />
          <ButtonEnable color='primary' isToastError onClick={save} radius='full'>
            Save
          </ButtonEnable>
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(SetupName);
