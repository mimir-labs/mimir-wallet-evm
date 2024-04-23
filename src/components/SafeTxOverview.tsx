// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import React, { useEffect } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import { addressEq } from '@mimir-wallet/utils';

import { approveCounts } from './safe-tx-modal/utils';
import AddressCell from './AddressCell';

interface Props {
  account: BaseAccount;
  signatures: SignatureResponse[];
}

type NodeData = {
  parentId: string | null;
  name?: string | null;
  members: BaseAccount[];
  isApprove: boolean;
  address: string;
};

const AddressNode = React.memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <>
      {data.members.length > 0 && (
        <Handle
          className='bg-default-300'
          isConnectable={isConnectable}
          position={Position.Left}
          style={{ width: 0, height: 0, top: 26 }}
          type='source'
        />
      )}
      <div className='w-[220px] bg-white flex justify-between items-center text-left p-2.5 h-auto rounded-medium border-1 border-secondary active:scale-[0.97] transition-all hover:bg-secondary shadow-medium hover:border-primary/5'>
        <div>
          <AddressCell fallbackName={data.name} withCopy address={data.address} iconSize={30} />
        </div>
        {data.isApprove && <div className='w-2.5 h-2.5 rounded-full bg-success' />}
      </div>
      {data.parentId ? (
        <Handle
          className='bg-default-300'
          isConnectable={isConnectable}
          position={Position.Right}
          style={{ width: 0, height: 0 }}
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
  signatures: SignatureResponse[],
  isApprove: boolean,
  parentId: string | null,
  xPos: number,
  yPos: number,
  xOffset: number,
  yOffset: number,
  onYChange?: (offset: number) => void,
  nodes: Node<NodeData>[] = [],
  edges: Edge[] = []
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
      isApprove
    },
    position: { x: xPos, y: yPos },
    connectable: false
  };

  nodes.push(node);

  if (parentId) {
    edges.push({
      id: `${parentId}_to_${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      style: { stroke: '#d9d9d9' },
      animated: true
    });
  }

  const nextX = xPos - xOffset;
  const childCount = members.length;

  const startY = yPos - ((childCount - 1) * yOffset) / 2;
  let nextY = startY;

  members.forEach((_account, index) => {
    const _signature = signatures?.find((item) => addressEq(item.signature.signer, _account.address));

    makeNodes(
      _account,
      _signature?.children || [],
      _account.type === 'safe'
        ? approveCounts(_account, _signature?.children || []) >= (_account.threshold || 1)
        : !!_signature,
      nodeId,
      nextX,
      nextY,
      xOffset,
      yOffset,
      (offset: number) => {
        onYChange?.(offset);
        nextY += offset;
      },
      nodes,
      edges
    );

    if (index < childCount - 1) {
      nextY += yOffset * ((_account.members || []).length || 1);
    }
  });

  const oldY = node.position.y;

  node.position.y = (nextY + startY) / 2;
  onYChange?.(node.position.y - oldY);
}

function SafeTxOverview({ account, signatures }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(
      account,
      signatures,
      approveCounts(account, signatures) >= (account.threshold || 1),
      null,
      0,
      0,
      300,
      78,
      undefined,
      nodes,
      edges
    );

    setNodes(nodes);
    setEdges(edges);
  }, [account, setEdges, setNodes, signatures]);

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
