// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { Divider, Link, Select, SelectItem } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAddress } from 'viem';
import { useAccount } from 'wagmi';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-filled.svg?react';
import { AddressRow, Button, ButtonEnable } from '@mimir-wallet/components';
import { supportedChains } from '@mimir-wallet/config';
import { useMediaQuery } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

function Detected({ multisigs }: { multisigs: Multisig[] }) {
  const { switchAddress } = useContext(AddressContext);
  const [selected, setSelected] = useState<[Address, number]>([multisigs[0].address, multisigs[0].chainId]);

  return (
    <div className='space-y-2.5 sm:w-[400px] w-full'>
      <Select
        color='secondary'
        variant='bordered'
        items={multisigs}
        selectedKeys={[selected.join('-')]}
        onChange={(e) => {
          const [address, chainId] = e.target.value.split('-');

          setSelected([getAddress(address), Number(chainId)]);
        }}
        renderValue={(items) => {
          return items.map((item) => (
            <div key={item.key} className='flex items-center'>
              <AddressRow
                thresholdVisible={false}
                key={item.key}
                address={item.data?.address}
                fallbackName={item.data?.name}
                iconSize={20}
                showFull
              />
            </div>
          ));
        }}
      >
        {(item) => (
          <SelectItem key={`${item.address}-${item.chainId}`} textValue={item.name || item.address}>
            <div className='flex items-center justify-between'>
              <AddressRow
                className='flex-grow-[1]'
                thresholdVisible={false}
                address={item.address}
                fallbackName={item.name}
                iconSize={20}
                showFull
              />
              {supportedChains.find(({ id }) => item.chainId === id)?.name}
            </div>
          </SelectItem>
        )}
      </Select>
      <Button
        color='primary'
        fullWidth
        radius='full'
        onClick={() => {
          switchAddress(selected[1], selected[0], '/');
        }}
      >
        Login
      </Button>

      <Divider />

      <div className='flex gap-5'>
        <Button as={Link} href='/create-multisig' radius='full' color='primary' variant='bordered' fullWidth>
          Create Multisig
        </Button>
        <Button as={Link} href='/import-multisig' radius='full' color='primary' variant='bordered' fullWidth>
          Import Multisig
        </Button>
      </div>
      <Button
        onClick={() => {
          switchAddress(selected[1], selected[0], '/');
        }}
        variant='light'
        color='primary'
      >
        {'Skip>'}
      </Button>
    </div>
  );
}

function Welcome() {
  const { isConnected } = useAccount();
  const { multisigs, current } = useContext(AddressContext);
  const upSm = useMediaQuery('sm');

  if (current) {
    return <Navigate replace to='/' />;
  }

  return (
    <div className='flex justify-center items-center sm:flex-row flex-col lg:gap-[80px] md:gap-[60px] sm:gap-[40px] gap-[20px] h-full'>
      <div className='sm:w-[309px] w-[185px] overflow-hidden sm:rounded-[30px] rounded-[18px]'>
        <video muted playsInline autoPlay loop src='/ux.mp4' controls={false} width='100%' />
      </div>
      <div className='sm:w-auto w-full space-y-5'>
        <h1 className='font-bold md:text-[40px] sm:text-[30px] text-[20px] leading-tight'>
          Start your ultimate
          {upSm ? <br /> : ''}
          multisig journey
        </h1>
        <p className='font-normal text-[16px] leading-[19px] tracking-[0.16px]'>
          · More security fund
          <br />
          · Policy Rules
          <br />· Enterprise-Level Operation
        </p>
        {isConnected ? (
          Object.keys(multisigs).length === 0 ? (
            <>
              <Button
                as={Link}
                href='/create-multisig'
                startContent={<IconAdd className='text-white' />}
                className='flex sm:w-[210px] w-full'
                radius='full'
                color='primary'
              >
                Create Multisig
              </Button>
              <Button
                as={Link}
                href='/import-multisig'
                startContent={<IconSend className='text-white' />}
                className='flex sm:w-[210px] w-full'
                radius='full'
                color='primary'
              >
                Import Multisig
              </Button>
            </>
          ) : (
            <>
              <h5 className='font-extrabold text-xl'>Detected Multisig</h5>
              <Detected multisigs={Object.values(multisigs).flat()} />
            </>
          )
        ) : (
          <ButtonEnable withConnect className='flex sm:w-[210px] w-full' color='primary'>
            Connect Wallet
          </ButtonEnable>
        )}
      </div>
    </div>
  );
}

export default Welcome;
