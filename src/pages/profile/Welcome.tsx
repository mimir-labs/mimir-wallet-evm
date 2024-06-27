// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import { Divider, Link, Select, SelectItem } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { useAccount } from 'wagmi';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-filled.svg?react';
import { AddressRow, Button, ButtonEnable } from '@mimir-wallet/components';
import { AddressContext } from '@mimir-wallet/providers';

function Detected({ multisigs }: { multisigs: Multisig[] }) {
  const { switchAddress } = useContext(AddressContext);
  const [selected, setSelected] = useState<Address>(multisigs[0].address);

  return (
    <div className='space-y-2.5 w-[400px]'>
      <Select
        color='secondary'
        variant='bordered'
        items={multisigs}
        selectedKeys={[selected]}
        onChange={(e) => setSelected(e.target.value as Address)}
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
          <SelectItem key={item.address} textValue={item.name || item.address}>
            <div className='flex items-center'>
              <AddressRow
                thresholdVisible={false}
                address={item.address}
                fallbackName={item.name}
                iconSize={20}
                showFull
              />
            </div>
          </SelectItem>
        )}
      </Select>
      <Button color='primary' fullWidth radius='full' onClick={() => switchAddress(selected)}>
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
      <Button onClick={() => switchAddress(selected)} variant='light' color='primary'>
        {'Skip>'}
      </Button>
    </div>
  );
}

function Welcome() {
  const { isConnected } = useAccount();
  const { multisigs } = useContext(AddressContext);

  return (
    <div className='flex justify-center items-center gap-[80px] h-full'>
      <div className='w-[309px] overflow-hidden rounded-[30px]'>
        <video muted playsInline autoPlay loop src='/ux.mp4' controls={false} width='100%' />
      </div>
      <div className='space-y-5'>
        <h1 className='font-bold text-[40px] leading-tight'>
          Start your ultimate
          <br />
          multisig journey
        </h1>
        <p className='font-normal text-[16px] leading-[19px] tracking-[0.16px]'>
          · More security fund
          <br />
          · Policy Rules
          <br />· Enterprise-Level Operation
        </p>
        {isConnected ? (
          multisigs.length === 0 ? (
            <>
              <Button
                as={Link}
                href='/create-multisig'
                startContent={<IconAdd className='text-white' />}
                className='flex w-[210px]'
                radius='full'
                color='primary'
              >
                Create Multisig
              </Button>
              <Button
                as={Link}
                href='/import-multisig'
                startContent={<IconSend className='text-white' />}
                className='flex w-[210px]'
                radius='full'
                color='primary'
              >
                Import Multisig
              </Button>
            </>
          ) : (
            <>
              <h5 className='font-extrabold text-xl'>Detected Multisig</h5>
              <Detected multisigs={multisigs} />
            </>
          )
        ) : (
          <ButtonEnable withConnect className='flex w-[210px]' color='primary'>
            Connect Wallet
          </ButtonEnable>
        )}
      </div>
    </div>
  );
}

export default Welcome;
