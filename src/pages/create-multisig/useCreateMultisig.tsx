// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'viem';
import type { IPublicClient, IWalletClient } from '@mimir-wallet/safe/types';
import type { AccountResponse } from '@mimir-wallet/utils/types';

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
  result?: AccountResponse;
  error?: Error | null;
}

async function simulate(client: IPublicClient, args: CreateSafeRequest) {
  const { result } = await client.simulateContract(args);

  return result;
}

const initialState: CreateMultisigState = {
  isLoading: false,
  currentStep: 0,
  steps: [
    ['get-address', null],
    [
      'send-tx',
      <Cell key='step-1-pending' icon={<WaitingAnimation loop={false} size={40} />} title='Send Transaction' />
    ],
    ['indexing', <Cell key='step-1-pending' icon={<WaitingAnimation loop={false} size={40} />} title='Indexing' />],
    [
      'complete',
      <Cell key='step-1-pending' icon={<WaitingAnimation loop={false} size={40} />} title='Mimir account is ready' />
    ]
  ],
  title: 'Getting your multisig address...',
  error: null
};

export function useCreateMultisig(
  owners: Address[],
  threshold: bigint,
  name: string,
  salt?: bigint
): [
  state: CreateMultisigState,
  start: (client: IPublicClient, wallet: IWalletClient) => Promise<void>,
  reset: () => void
] {
  const [state, setState] = useSetState<CreateMultisigState>(initialState);
  const requestRef = useRef<CreateSafeRequest | null>(null);
  const addressRef = useRef<Address | null>(null);

  const starter = [
    async (client: IPublicClient, wallet: IWalletClient) => {
      const fallbackHandler = deployments[wallet.chain.id].CompatibilityFallbackHandler[0];

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
        error: null,
        currentStep: 0,
        steps: state.steps.map((step, index) =>
          index === 0
            ? [
                step[0],
                <Cell
                  key='step-0-pending'
                  icon={<Spinner color='primary' className='w-10 h-10' />}
                  title='Pending'
                  description='Getting your multisig address'
                />
              ]
            : step
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
              index === 0
                ? [
                    step[0],
                    <Cell
                      key='step-0-failed'
                      icon={<FailedAnimation size={40} />}
                      title='Failed'
                      description={<TxError error={error} />}
                    />
                  ]
                : step
            )
          }));

          throw error;
        });
    },

    async (client: IPublicClient, wallet: IWalletClient) => {
      if (!requestRef.current) {
        throw new Error('Please retry');
      }

      const request = requestRef.current;

      setState((state) => ({
        ...state,
        error: null,
        currentStep: 1,
        steps: state.steps.map((step, index) =>
          index === 1
            ? [
                step[0],
                <Cell
                  key='step-1-sign'
                  icon={<Spinner color='primary' className='w-10 h-10' />}
                  title='Sign'
                  description='Sign transaction in your wallet.'
                />
              ]
            : step
        )
      }));

      return wallet
        .writeContract(request)
        .then((hash) => {
          service.createMultisig(wallet.chain.id, hash, name);

          setState((state) => ({
            ...state,
            steps: state.steps.map((step, index) =>
              index === 1
                ? [
                    step[0],
                    <Cell
                      key='step-1-pending'
                      icon={<Spinner color='primary' className='w-10 h-10' />}
                      title='Pending'
                      description='Waiting for confirmation.'
                    />
                  ]
                : step
            )
          }));

          return client.waitForTransactionReceipt({ hash, retryCount: 30 });
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
                        <Link
                          className='text-tiny'
                          isExternal
                          showAnchorIcon
                          href={explorerUrl('tx', wallet.chain, receipt.transactionHash)}
                        >{`${receipt.transactionHash.slice(0, 10)}...${receipt.transactionHash.slice(-8)}`}</Link>
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
              index === 1
                ? [
                    step[0],
                    <Cell
                      key='step-1-failed'
                      icon={<FailedAnimation size={40} />}
                      title='Failed'
                      description={<TxError error={error} />}
                    />
                  ]
                : step
            )
          }));

          throw error;
        });
    },

    async (_: IPublicClient, wallet: IWalletClient) => {
      if (!addressRef.current) {
        throw new Error('Please retry');
      }

      const address = addressRef.current;

      setState((state) => ({
        ...state,
        error: null,
        currentStep: 2,
        steps: state.steps.map((step, index) =>
          index === 2
            ? [
                step[0],
                <Cell
                  key='step-2-indexing'
                  icon={<Spinner color='primary' className='w-10 h-10' />}
                  title='Indexing'
                  description='Wait for indexing'
                />
              ]
            : step
        )
      }));

      let account: AccountResponse;

      while (true) {
        try {
          account = await service.getAccount(wallet.chain.id, address);
          break;
        } catch {
          /* empty */
        }

        await sleep(3_000);
      }

      setState((state) => ({
        ...state,
        currentStep: 2,
        steps: state.steps.map((step, index) =>
          index === 2
            ? [step[0], <Cell key='step-2-success' icon={<SuccessAnimation size={40} />} title='Indexed' />]
            : step
        ),
        result: account
      }));
      await sleep(500);
    },

    async () => {
      setState((state) => ({
        ...state,
        currentStep: 3,
        steps: state.steps.map((step, index) =>
          index === 3
            ? [
                step[0],
                <Cell key='step-3-success' icon={<SuccessAnimation size={40} />} title='MIMIR Account is ready' />
              ]
            : step
        )
      }));
    }
  ];

  const start = async (client: IPublicClient, wallet: IWalletClient) => {
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

  const reset = () => {
    setState(initialState);
  };

  return [state, start, reset];
}
