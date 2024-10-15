// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import React, { useEffect } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';
import { useAccount } from 'wagmi';

import IconSuccessFill from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-outlined.svg?react';
import { type SignatureResponse, type TransactionResponse, TransactionStatus } from '@mimir-wallet/hooks/types';
import { approveCounts } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import AddressCell from './AddressCell';
import { getLayoutedElements } from './AddressOverview';
import SafeTxButton from './SafeTxButton';

interface Props {
  account: BaseAccount;
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
  onApprove?: () => void;
  onClose?: () => void;
}

type NodeData = {
  parentId: string | null;
  name?: string | null;
  members: BaseAccount[];
  isApprove: boolean;
  address: string;
  addressChain: Address[];
  transaction: TransactionResponse;
  signatures: SignatureResponse[];
  onApprove?: () => void;
  onClose?: () => void;
};

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { address } = useAccount();

  return (
    <>
      {data.members.length > 0 && (
        <Handle
          data-approved={data.isApprove}
          className='bg-default-300 data-[approved=true]:bg-success'
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ width: 10, height: 10 }}
          type='source'
        />
      )}
      <div className='overflow-hidden w-[220px] h-auto rounded-medium border-1 border-secondary transition-all hover:bg-secondary shadow-medium hover:border-primary/5'>
        <div className='flex justify-between items-center text-left bg-white p-2.5'>
          <div>
            <AddressCell fallbackName={data.name} withCopy address={data.address} iconSize={30} />
          </div>
          {data.isApprove && <IconSuccessFill className='text-success' />}
        </div>
        {data.transaction.status === TransactionStatus.Pending &&
          address &&
          !data.isApprove &&
          addressEq(address, data.address) && (
            <SafeTxButton
              isApprove
              isCancel={false}
              isSignatureReady={false}
              safeTx={data.transaction}
              signatures={data.signatures}
              address={data.transaction.address as Address}
              addressChain={data.addressChain}
              metadata={{
                website: data.transaction.website,
                iconUrl: data.transaction.iconUrl,
                appName: data.transaction.appName
              }}
              onSuccess={data.onApprove}
              startContent={<IconSuccess />}
              fullWidth
              size='sm'
              color='success'
              radius='none'
              className='flex bg-success/10 border-none text-success'
              variant='flat'
              onOpenTx={data.onClose}
            >
              Approve
            </SafeTxButton>
          )}
      </div>
      {data.parentId ? (
        <Handle
          data-approved={data.isApprove}
          className='bg-default-300 data-[approved=true]:bg-success'
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ width: 10, height: 10 }}
          type='target'
        />
      ) : null}
    </>
  );
});

const nodeTypes = {
  AddressNode
};

function makeNodes(
  account: BaseAccount,
  transaction: TransactionResponse,
  superSignatures: SignatureResponse[],
  signatures: SignatureResponse[],
  isApprove: boolean,
  parentId: string | null,
  nodes: Node<NodeData>[] = [],
  edges: Edge[] = [],
  onApprove?: () => void,
  onClose?: () => void
): void {
  const members = account.members || [];

  const nodeId = `${parentId}-${account.address}`;

  const node: Node<NodeData> = {
    id: nodeId,
    resizing: true,
    type: 'AddressNode',
    data: {
      address: account.address,
      name: account.name,
      parentId,
      members,
      isApprove,
      transaction,
      signatures: superSignatures,
      addressChain: nodeId.split('-').slice(2) as Address[],
      onApprove,
      onClose
    },
    position: { x: 0, y: 0 },
    connectable: false
  };

  nodes.push(node);

  if (parentId) {
    edges.push({
      id: `${parentId}_to_${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#d9d9d9' }
    });
  }

  members.forEach((_account) => {
    const _signature = signatures?.find((item) => addressEq(item.signature.signer, _account.address));

    makeNodes(
      _account,
      transaction,
      superSignatures,
      _signature?.children || [],
      approveCounts(_account, _signature?.children || [], !!_signature) >= (_account.threshold || 1),
      nodeId,
      nodes,
      edges,
      onApprove,
      onClose
    );
  });
}

function SafeTxOverview({ account, signatures, transaction, onApprove, onClose }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge[] = [];

    makeNodes(
      account,
      transaction,
      signatures,
      signatures,
      approveCounts(account, signatures, true) >= (account.threshold || 1),
      null,
      initialNodes,
      initialEdges,
      onApprove,
      onClose
    );
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 260, 70);

    setNodes(nodes);
    setEdges(edges);
  }, [account, onApprove, onClose, setEdges, setNodes, signatures, transaction]);

  return (
    <ReactFlow
      edges={edges}
      fitView
      fitViewOptions={{
        maxZoom: 1.5,
        minZoom: 0.1,
        nodes
      }}
      maxZoom={1.5}
      minZoom={0.1}
      nodeTypes={nodeTypes}
      nodes={nodes}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      zoomOnScroll
    />
  );
}

export default React.memo(SafeTxOverview);
