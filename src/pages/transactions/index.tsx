// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { Tab, Tabs } from '@nextui-org/react';
import { useContext, useEffect } from 'react';
import { useChainId } from 'wagmi';

import { SafeTxCard } from '@mimir-wallet/components';
import { useHistoryTransactions, useQueryAccount, useQueryParam, useSafeNonce } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

import Pending from './Pending';

function History({ account }: { account: BaseAccount }) {
  const chainId = useChainId();
  const [nonce] = useSafeNonce(account.address);
  const [items] = useHistoryTransactions(chainId, account.address, nonce);

  return (
    <div className='space-y-5'>
      {Object.entries(items).map(([nonce, value]) => (
        <SafeTxCard defaultOpen={false} account={account} key={`queue-${nonce}`} data={value} nonce={BigInt(nonce)} />
      ))}
    </div>
  );
}

function Transaction() {
  const { current, isMultisig } = useContext(AddressContext);
  const [address, setAddress] = useQueryParam<string>('address', undefined, { replace: true });
  const [tab, setTab] = useQueryParam<string>('tab', 'pending', { replace: true });
  const account = useQueryAccount(address as Address);

  useEffect(() => {
    if (!address) {
      if (current && isMultisig(current)) {
        setAddress(current);
      }
    }
  }, [address, current, isMultisig, setAddress]);

  return (
    <div className='space-y-5'>
      {account && (
        <Tabs
          color='primary'
          aria-label='Transaction'
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key.toString())}
          classNames={{
            tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
            tabContent: ['text-primary/50', 'font-bold'],
            cursor: ['rounded-medium']
          }}
        >
          <Tab key='pending' title='Pending'>
            <Pending account={account} />
          </Tab>
          <Tab key='history' title='History'>
            <History account={account} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

export default Transaction;
