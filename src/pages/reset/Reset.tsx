// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadContracts } from 'wagmi';

import { abis } from '@mimir-wallet/abis';
import { AddressTransfer, Alert, Button, ButtonEnable, ButtonLinearBorder, Input } from '@mimir-wallet/components';
import { ONE_DAY } from '@mimir-wallet/constants';
import { useInputAddress, useInputNumber } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildChangeMember } from '@mimir-wallet/safe';
import { type IPublicClient, type IWalletClient, Operation } from '@mimir-wallet/safe/types';
import { addressEq } from '@mimir-wallet/utils';

function ResetMember({
  delayAddress,
  safeAddress,
  members,
  threshold: propsThreshold
}: {
  delayAddress: Address;
  safeAddress: Address;
  members: Address[];
  threshold: number;
}) {
  const { all } = useContext(AddressContext);
  const [selected, setSelected] = useState<Address[]>(members);
  const [[address, isValidAddress], onAddressChange] = useInputAddress(undefined);
  const [[threshold], setThreshold] = useInputNumber(propsThreshold.toString(), true, 1);
  const navigate = useNavigate();
  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: abis.Delay,
        address: delayAddress,
        functionName: 'txExpiration'
      },
      {
        abi: abis.Delay,
        address: delayAddress,
        functionName: 'txCooldown'
      }
    ]
  });

  const isValid = selected.length > 1 && Number(threshold) > 0;

  const reset = () => {
    setSelected(members);
    setThreshold(propsThreshold.toString());
  };

  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      const safeTx = await buildChangeMember(client, safeAddress, selected, threshold);
      const { request } = await client.simulateContract({
        account: wallet.account,
        address: delayAddress,
        abi: abis.Delay,
        functionName: 'execTransactionFromModule',
        args: [safeAddress, 0n, safeTx.data, Operation.Call]
      });

      const hash = await wallet.writeContract(request);

      await client.waitForTransactionReceipt({ hash, confirmations: 2 });
      navigate('/transactions');
    },
    [delayAddress, navigate, safeAddress, selected, threshold]
  );

  const addresses = useMemo(() => all.filter((item) => !addressEq(item, safeAddress)), [all, safeAddress]);

  return (
    <div className='space-y-5'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        Back
      </Button>

      <Card>
        <CardHeader className='px-5'>
          <h4 className='font-bold text-xl'>Reset Multisig</h4>
        </CardHeader>
        <Divider />
        <CardBody className='p-5 space-y-4'>
          <div className='flex items-end gap-2'>
            <Input
              color={isValidAddress || !address ? undefined : 'danger'}
              errorMessage={isValidAddress || !address ? null : 'Please input ethereum address'}
              value={address}
              onChange={onAddressChange}
              label='Add Multisig Wallet Members'
              type='text'
              placeholder='Enter ethereum address'
              variant='bordered'
              labelPlacement='outside'
            />
            <Button
              onClick={() => {
                if (isValidAddress) {
                  setSelected((value) => Array.from(new Set([...value, address])) as Address[]);
                  onAddressChange('');
                }
              }}
              className='min-w-14'
              radius='full'
              color='primary'
            >
              Add
            </Button>
          </div>
          <AddressTransfer onChange={setSelected} selected={selected} addresses={addresses} />
          <div>
            <Input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              label='Threshold'
              placeholder='Threshold'
              variant='bordered'
              labelPlacement='outside'
            />
          </div>
          <div>
            <Input
              value={data ? `${Number(data[0]) / ONE_DAY} Days` : ''}
              disabled
              label='Review Period'
              placeholder='fetching...'
              variant='bordered'
              labelPlacement='outside'
            />
          </div>
          <div>
            <Input
              value={data ? `${Number(data[1]) / ONE_DAY} Days` : ''}
              disabled
              label='Proposal Expiry'
              placeholder='fetching...'
              variant='bordered'
              labelPlacement='outside'
            />
          </div>
          <Alert
            severity='warning'
            title='Notice'
            content={
              <ul className='list-disc pl-3'>
                <li>Fee is necessary for creation.</li>
                <li>
                  Use a threshold higher than one to prevent losing access to your Multisig Account in case an owner key
                  is lost or compromised.
                </li>
              </ul>
            }
          />
          <div className='flex gap-3'>
            <ButtonLinearBorder onClick={reset} fullWidth radius='full'>
              Reset
            </ButtonLinearBorder>
            <ButtonEnable
              isToastError
              onClick={handleClick}
              disabled={!isValid}
              fullWidth
              radius='full'
              color='primary'
            >
              Save
            </ButtonEnable>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default React.memo(ResetMember);
