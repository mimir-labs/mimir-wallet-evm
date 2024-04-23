// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IWalletClient, Multisig } from '@mimir-wallet/safe/types';

import { Card, CardBody } from '@nextui-org/react';
import React, { useContext } from 'react';
import { useAsyncFn } from 'react-use';

import { ButtonEnable, ButtonLinear, Input } from '@mimir-wallet/components';
import { toastError } from '@mimir-wallet/components/ToastRoot';
import { useInput } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { signChangeName } from '@mimir-wallet/safe';
import { service } from '@mimir-wallet/utils';

function SetupName({ multisig }: { multisig?: Multisig }) {
  const { changeName } = useContext(AddressContext);
  const [name, setName] = useInput(multisig?.name || '');

  const [state, save] = useAsyncFn(
    async (wallet: IWalletClient) => {
      if (!multisig) {
        throw new Error(`Not multisig account`);
      }

      if (!name) {
        throw new Error('Please enter new name');
      }

      return signChangeName(wallet, multisig, name)
        .then((signature) => service.changeName(wallet.chain.id, multisig.address, name, signature))
        .then(() => changeName(multisig.address, name))
        .catch(toastError);
    },
    [changeName, multisig, name]
  );

  return (
    <Card>
      <CardBody className='p-5 space-y-4'>
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
        <ButtonEnable Component={ButtonLinear} isLoading={state.loading} onClick={save} radius='full'>
          Save
        </ButtonEnable>
      </CardBody>
    </Card>
  );
}

export default React.memo(SetupName);
