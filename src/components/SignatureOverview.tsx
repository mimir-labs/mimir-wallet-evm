// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import React, { useEffect } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import IconSuccessFill from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import { EmptyArray } from '@mimir-wallet/constants';
import { approveCounts } from '@mimir-wallet/safe';
import { addressEq } from '@mimir-wallet/utils';

import AddressCell from './AddressCell';
import { getLayoutedElements } from './AddressOverview';

type Operate = (address: Address, addressChain: Address[], isApprove: boolean) => React.ReactNode;

interface Props {
  account: BaseAccount;
  signatures?: SignatureResponse[];
  operate?: Operate;
}

type NodeData = {
  parentId: string | null;
  name?: string | null;
  members: BaseAccount[];
  isApprove: boolean;
  address: Address;
  addressChain: Address[];
  signatures: SignatureResponse[];
  operate?: Operate;
};

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <>
      {data.members.length > 0 && (
        <Handle
          data-approved={data.isApprove}
          className='bg-default-300 data-[approved=true]:bg-success'
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ width: 10, height: 10, top: 26 }}
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
        {data.operate ? data.operate(data.address, data.addressChain, data.isApprove) : null}
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
  superSignatures: SignatureResponse[],
  signatures: SignatureResponse[],
  isApprove: boolean,
  parentId: string | null,
  nodes: Node<NodeData>[] = [],
  edges: Edge[] = [],
  operate?: Operate
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
      signatures: superSignatures,
      addressChain: nodeId.split('-').slice(2) as Address[],
      operate
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
      superSignatures,
      _signature?.children || [],
      approveCounts(_account, _signature?.children || [], !!_signature) >= (_account.threshold || 1),
      nodeId,
      nodes,
      edges,
      operate
    );
  });
}

function SignatureOverview({ account, signatures = EmptyArray, operate }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge[] = [];

    makeNodes(
      account,
      signatures,
      signatures,
      approveCounts(account, signatures, true) >= (account.threshold || 1),
      null,
      initialNodes,
      initialEdges,
      operate
    );
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, 260, 70);

    setNodes(nodes);
    setEdges(edges);
  }, [account, operate, setEdges, setNodes, signatures]);

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

export default React.memo(SignatureOverview);
