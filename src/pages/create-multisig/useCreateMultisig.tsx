// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Account, Address, Chain, PublicClient, Transport, WalletClient } from 'viem';

import { Link, Spinner } from '@nextui-org/react';
import React, { useRef } from 'react';
import { useSetState } from 'react-use';

import { AddressCell, FailedAnimation, SuccessAnimation, TxError, WaitingAnimation } from '@mimir-wallet/components';
import { deployments } from '@mimir-wallet/config';
import { type CreateSafeRequest, createSafeRequest } from '@mimir-wallet/safe';
import { explorerUrl, service, sleep } from '@mimir-wallet/utils';

import Cell from './Cell';

export interface CreateMultisigState {
  isLoading: boolean;
  currentStep: number;
  steps: [key: string, element: React.ReactNode][];
  title: string;
  error?: Error | null;
}

async function simulate(client: PublicClient, args: CreateSafeRequest) {
  const { result } = await client.simulateContract(args);

  return result;
}

const initialState: CreateMultisigState = {
  isLoading: false,
  currentStep: 0,
  steps: [
    ['get-address', null],
    ['send-tx', <Cell key='step-1-pending' icon={<WaitingAnimation loop={false} size={40} />} title='Send Transaction' />],
    ['indexing', <Cell key='step-1-pending' icon={<WaitingAnimation loop={false} size={40} />} title='Indexing' />],
    ['complete', <Cell key='step-1-pending' icon={<WaitingAnimation loop={false} size={40} />} title='Mimir account is ready' />]
  ],
  title: 'Getting your multisig address...',
  error: null
};

export function useCreateMultisig(
  owners: Address[],
  threshold: bigint,
  name: string,
  salt?: bigint
): [state: CreateMultisigState, start: (client: PublicClient, wallet: WalletClient<Transport, Chain, Account>) => Promise<void>] {
  const [state, setState] = useSetState<CreateMultisigState>(initialState);
  const requestRef = useRef<CreateSafeRequest | null>(null);
  const addressRef = useRef<Address | null>(null);

  const starter = [
    async (client: PublicClient, wallet: WalletClient<Transport, Chain, Account>) => {
      const fallbackHandler = deployments[wallet.chain.id].CompatibilityFallbackHandler;

      const request = createSafeRequest(
        wallet.chain,
        wallet.account.address,
        {
          owners,
          threshold,
          fallbackHandler
        },
        undefined,
        undefined,
        salt
      );

      setState((state) => ({
        ...state,
        currentStep: 0,
        steps: state.steps.map((step, index) =>
          index === 0 ? [step[0], <Cell key='step-0-pending' icon={<Spinner color='primary' className='w-10 h-10' />} title='Pending' description='Getting your multisig address' />] : step
        )
      }));

      requestRef.current = request;

      return simulate(client, request)
        .then((address) => {
          addressRef.current = address;
          setState((state) => ({
            ...state,
            steps: state.steps.map((step, index) =>
              index === 0
                ? [
                    step[0],
                    <div className='w-full' key='step-0-success'>
                      <AddressCell iconSize={40} address={address} showFull fallbackName={name} />
                    </div>
                  ]
                : step
            )
          }));
        })
        .catch((error) => {
          setState((state) => ({
            ...state,
            steps: state.steps.map((step, index) =>
              index === 0 ? [step[0], <Cell key='step-0-failed' icon={<FailedAnimation size={40} />} title='Failed' description={<TxError error={error} />} />] : step
            )
          }));

          throw error;
        });
    },

    async (client: PublicClient, wallet: WalletClient<Transport, Chain, Account>) => {
      if (!requestRef.current) {
        throw new Error('Please retry');
      }

      const request = requestRef.current;

      setState((state) => ({
        ...state,
        currentStep: 1,
        steps: state.steps.map((step, index) =>
          index === 1 ? [step[0], <Cell key='step-1-sign' icon={<Spinner color='primary' className='w-10 h-10' />} title='Sign' description='Sign transaction in your wallet.' />] : step
        )
      }));

      return wallet
        .writeContract(request)
        .then((hash) => {
          service.createMultisig(wallet.chain.id, hash, name);

          setState((state) => ({
            ...state,
            steps: state.steps.map((step, index) =>
              index === 1 ? [step[0], <Cell key='step-1-pending' icon={<Spinner color='primary' className='w-10 h-10' />} title='Pending' description='Waiting for confirmation.' />] : step
            )
          }));

          return client.waitForTransactionReceipt({ hash });
        })
        .then((receipt) => {
          setState((state) => ({
            ...state,
            steps: state.steps.map((step, index) =>
              index === 1
                ? [
                    step[0],
                    <Cell
                      key='step-1-success'
                      icon={<SuccessAnimation size={40} />}
                      title='Transaction Success'
                      description={
                        <Link className='text-tiny' isExternal showAnchorIcon href={explorerUrl('tx', wallet.chain, receipt.transactionHash)}>{`${receipt.transactionHash.slice(
                          0,
                          10
                        )}...${receipt.transactionHash.slice(-8)}`}</Link>
                      }
                    />
                  ]
                : step
            )
          }));
        })
        .catch((error) => {
          setState((state) => ({
            ...state,
            steps: state.steps.map((step, index) =>
              index === 1 ? [step[0], <Cell key='step-1-failed' icon={<FailedAnimation size={40} />} title='Failed' description={<TxError error={error} />} />] : step
            )
          }));

          throw error;
        });
    },

    async (_: PublicClient, wallet: WalletClient<Transport, Chain, Account>) => {
      if (!addressRef.current) {
        throw new Error('Please retry');
      }

      const address = addressRef.current;

      setState((state) => ({
        ...state,
        currentStep: 2,
        steps: state.steps.map((step, index) =>
          index === 2 ? [step[0], <Cell key='step-2-indexing' icon={<Spinner color='primary' className='w-10 h-10' />} title='Indexing' description='Wait for indexing' />] : step
        )
      }));

      while (true) {
        try {
          await service.getAccount(wallet.chain.id, address);
          break;
        } catch {
          /* empty */
        }

        await sleep(10_000);
      }

      setState((state) => ({
        ...state,
        currentStep: 2,
        steps: state.steps.map((step, index) => (index === 2 ? [step[0], <Cell key='step-2-success' icon={<SuccessAnimation size={40} />} title='Indexed' />] : step))
      }));
      await sleep(500);
    },

    async () => {
      setState((state) => ({
        ...state,
        currentStep: 3,
        steps: state.steps.map((step, index) => (index === 3 ? [step[0], <Cell key='step-3-success' icon={<SuccessAnimation size={40} />} title='MIMIR Account is ready' />] : step))
      }));
    }
  ];

  const start = async (client: PublicClient, wallet: WalletClient<Transport, Chain, Account>) => {
    try {
      setState((state) => ({ ...state, isLoading: true }));

      for (let i = state.currentStep; i < state.steps.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await starter[i](client, wallet);
      }
    } catch (error) {
      console.log(error);
      setState((state) => ({ ...state, error: error as Error }));
    } finally {
      setState((state) => ({ ...state, isLoading: false }));
    }
  };

  return [state, start];
}
