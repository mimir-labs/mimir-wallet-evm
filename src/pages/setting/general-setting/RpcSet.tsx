// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody } from '@nextui-org/react';
import React from 'react';
import { useAsyncFn } from 'react-use';
import { createPublicClient, http } from 'viem';
import { useChains } from 'wagmi';

import { ButtonEnable, Input } from '@mimir-wallet/components';
import { toastError } from '@mimir-wallet/components/ToastRoot';
import { CHAIN_RPC_URL_PREFIX } from '@mimir-wallet/constants';
import { useInput, useLocalStore } from '@mimir-wallet/hooks';
import { isValidURL } from '@mimir-wallet/utils';

function RpcSet() {
  const [chain] = useChains();
  const [rpc, setRpc] = useLocalStore<string>(`${CHAIN_RPC_URL_PREFIX}${chain.id}`);
  const [value, setValue] = useInput(rpc);

  const [state, handleClick] = useAsyncFn(async () => {
    if (!value) {
      setRpc('');
      window.location.reload();

      return;
    }

    try {
      if (!isValidURL(value)) {
        throw new Error('Not a valid URL');
      }

      const provider = createPublicClient({
        transport: http(value)
      });

      const chainId = await provider.getChainId();

      if (chainId !== chain.id) {
        throw new Error('RPC chainId error');
      }

      setRpc(value);
      window.location.reload();
    } catch (error) {
      toastError(error);
    }
  }, [chain.id, setRpc, value]);

  return (
    <Card className='w-full'>
      <CardBody className='p-5 space-y-5'>
        <Input
          value={value}
          type='text'
          variant='bordered'
          labelPlacement='outside'
          onChange={setValue}
          label='RPC provider'
          placeholder={chain.rpcUrls.default.http[0]}
          description='You can override some of our default APIs here in case you need to. Proceed at your own risk.'
          fullWidth
        />
        <ButtonEnable isLoading={state.loading} onClick={handleClick} color='primary' isToastError radius='full'>
          Save
        </ButtonEnable>
      </CardBody>
    </Card>
  );
}

export default React.memo(RpcSet);
