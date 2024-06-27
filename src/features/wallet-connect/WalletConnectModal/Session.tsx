// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Web3WalletTypes } from '@walletconnect/web3wallet';

import { Avatar, Divider, Link } from '@nextui-org/react';
import { useContext } from 'react';
import { useAsyncFn } from 'react-use';
import { useChainId, useChains } from 'wagmi';

import { AddressCell, Alert, Button } from '@mimir-wallet/components';
import { toastError } from '@mimir-wallet/components/ToastRoot';
import { AddressContext } from '@mimir-wallet/providers';

import { approveSession, rejectSession } from '../wallet-connect';
import { WalletConnectContext } from '../WalletConnectProvider';

function Session({ proposal, onClose }: { proposal: Web3WalletTypes.SessionProposal; onClose: () => void }) {
  const chainId = useChainId();
  const [chain] = useChains();
  const { current } = useContext(AddressContext);
  const { deleteProposal } = useContext(WalletConnectContext);

  const [rejectState, handleReject] = useAsyncFn(async () => {
    deleteProposal();
    await rejectSession(proposal);
  }, [deleteProposal, proposal]);

  const [approveState, handleApprove] = useAsyncFn(async () => {
    if (!current) {
      return;
    }

    try {
      await approveSession(proposal, chainId, current);
      onClose();
    } catch (error) {
      toastError(error);
    }
  }, [chainId, current, onClose, proposal]);

  return (
    <div className='flex flex-col gap-5 items-center'>
      <Avatar src={proposal.params.proposer.metadata.icons?.[0]} style={{ width: 80, height: 80 }} />
      <div>
        <h4 className='font-bold text-xl text-center'>{proposal.params.proposer.metadata.name}</h4>
        <p className='text-small'>
          <Link isExternal href={proposal.params.proposer.metadata.url}>
            {proposal.params.proposer.metadata.url}
          </Link>
        </p>
      </div>
      <p className='text-small'>
        You authorize access to {proposal.params.proposer.metadata.name} with the following identity.
      </p>

      {current ? (
        <div className='rounded-medium bg-secondary p-2.5 w-full'>
          <AddressCell showFull address={current} iconSize={30} />
        </div>
      ) : (
        <Alert severity='error' title='Please create or select multisig account' />
      )}

      <Divider />
      <Alert severity='warning' title={`Make sure the Dapp is connecting to ${chain.name}`} className='w-full' />
      <div className='flex w-full gap-2.5'>
        <Button
          fullWidth
          radius='full'
          color='primary'
          variant='bordered'
          onClick={handleReject}
          isLoading={rejectState.loading}
        >
          Reject
        </Button>
        <Button fullWidth radius='full' color='primary' onClick={handleApprove} isLoading={approveState.loading}>
          Approve
        </Button>
      </div>
    </div>
  );
}

export default Session;
