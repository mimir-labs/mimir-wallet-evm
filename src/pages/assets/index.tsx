// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs } from '@nextui-org/react';
import { useContext } from 'react';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/components';
import { useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import AddToken from './AddToken';
import Nfts from './Nfts';
import Tokens from './Tokens';

function Assets() {
  const [tab, setTab] = useQueryParam('tab', 'token', { replace: true });
  const { current } = useContext(AddressContext);
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <div className='relative space-y-5'>
        <div className='absolute right-0 top-8'>
          {tab === 'token' && (
            <Button onClick={toggleOpen} radius='full' color='primary'>
              Add
            </Button>
          )}
        </div>
        <Tabs
          color='primary'
          variant='solid'
          aria-label='Tabs'
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key.toString())}
          classNames={{
            tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
            tabContent: ['text-primary/50', 'font-bold'],
            cursor: ['rounded-medium']
          }}
        >
          <Tab key='token' title='Tokens'>
            {current && <Tokens address={current} />}
          </Tab>
          <Tab key='nft' title='NFTs'>
            {current && <Nfts address={current} />}
          </Tab>
        </Tabs>
      </div>

      <AddToken isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default Assets;
