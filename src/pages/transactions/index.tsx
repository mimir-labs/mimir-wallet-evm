// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { IPublicClient, IWalletClient, SafeTransaction } from '@mimir-wallet/safe/types';

import { Tab, Tabs } from '@nextui-org/react';
import { useContext, useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import { useChainId } from 'wagmi';

import { Empty, TxCard } from '@mimir-wallet/components';
import {
  useHistoryTransactions,
  usePendingTransactions,
  useQueryAccount,
  useQueryParam,
  useSafeInfo
} from '@mimir-wallet/hooks';
import { AddressContext, SafeContext } from '@mimir-wallet/providers';

function Pending({ address }: { address: Address }) {
  const { openTxModal } = useContext(SafeContext);
  const chainId = useChainId();
  const info = useSafeInfo(address);
  const nonce = info?.[0];
  const [{ current, queue }] = usePendingTransactions(chainId, address, nonce);
  const account = useQueryAccount(address);

  const [, handleApprove] = useAsyncFn(
    async (wallet: IWalletClient, client: IPublicClient, tx: SafeTransaction, signatures: SignatureResponse[]) => {
      openTxModal({
        isApprove: true,
        signatures,
        address,
        safeTx: tx
      });
    },
    [address, openTxModal]
  );

  return (
    <div className='space-y-5'>
      {!current && Object.entries(queue).length === 0 && <Empty height='80dvh' />}
      {current && (
        <div>
          <h6 className='font-bold text-medium mb-2'>Next</h6>
          <div className='space-y-5'>
            <TxCard
              defaultOpen
              account={account}
              handleApprove={handleApprove}
              key={`current-${current[0].toString()}`}
              data={current[1]}
              nonce={current[0]}
            />
          </div>
        </div>
      )}
      {Object.entries(queue).length > 0 && (
        <div>
          <h6 className='font-bold text-medium mb-2'>Queuing</h6>
          <div className='space-y-5'>
            {Object.entries(queue).map(([nonce, value]) => (
              <TxCard
                handleApprove={handleApprove}
                account={account}
                key={`queue-${nonce}`}
                data={value}
                nonce={BigInt(nonce)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function History({ address }: { address: Address }) {
  const chainId = useChainId();
  const info = useSafeInfo(address);
  const nonce = info?.[0];
  const [items] = useHistoryTransactions(chainId, address, nonce);
  const account = useQueryAccount(address);

  return (
    <div className='space-y-5'>
      {Object.entries(items).map(([nonce, value]) => (
        <TxCard defaultOpen={false} account={account} key={`queue-${nonce}`} data={value} nonce={BigInt(nonce)} />
      ))}
    </div>
  );
}

function Transaction() {
  const { current, isMultisig } = useContext(AddressContext);
  const [address, setAddress] = useQueryParam<string>('address', undefined, { replace: true });
  const [tab, setTab] = useQueryParam<string>('tab', 'pending', { replace: true });

  useEffect(() => {
    if (!address) {
      if (current && isMultisig(current)) {
        setAddress(current);
      }
    }
  }, [address, current, isMultisig, setAddress]);

  return (
    <div className='space-y-5'>
      {address && (
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
            <Pending address={address as Address} />
          </Tab>
          <Tab key='history' title='History'>
            <History address={address as Address} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
}

export default Transaction;
