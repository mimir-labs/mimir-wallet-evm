// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount } from '@mimir-wallet/safe/types';

import React, { useEffect } from 'react';
import ReactFlow, { Edge, Handle, Node, NodeProps, Position, useEdgesState, useNodesState } from 'reactflow';

import { EmptyArray } from '@mimir-wallet/constants';

import AddressCell from './AddressCell';

interface Props {
  account: BaseAccount;
}

type NodeData = { parentId: string | null; name?: string | null; members: BaseAccount[]; address: string };

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
      <div className='w-[220px] bg-white flex justify-start text-left p-2.5 h-auto rounded-medium border-1 border-secondary active:scale-[0.97] transition-all hover:bg-secondary shadow-medium hover:border-primary/5'>
        <AddressCell withCopy address={data.address} iconSize={30} />
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
  parentId: string | null,
  xPos: number,
  yPos: number,
  xOffset: number,
  yOffset: number,
  onYChange?: (offset: number) => void,
  nodes: Node<NodeData>[] = EmptyArray,
  edges: Edge[] = EmptyArray
): void {
  const members = account.members || EmptyArray;

  const nodeId = `${parentId}-${account.address}`;

  const node: Node<NodeData> = {
    id: nodeId,
    resizing: true,
    type: 'AddressNode',
    data: { address: account.address, name: account.name, parentId, members },
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
      style: { stroke: '#d9d9d9' }
    });
  }

  const nextX = xPos - xOffset;
  const childCount = members.length;

  const startY = yPos - ((childCount - 1) * yOffset) / 2;
  let nextY = startY;

  members.forEach((_account, index) => {
    makeNodes(
      _account,
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
      nextY += yOffset * ((_account.members || EmptyArray).length || 1);
    }
  });

  const oldY = node.position.y;

  node.position.y = (nextY + startY) / 2;
  onYChange?.(node.position.y - oldY);
}

function AddressOverview({ account }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];

    makeNodes(account, null, 0, 0, 300, 78, undefined, nodes, edges);

    setNodes(nodes);
    setEdges(edges);
  }, [account, setEdges, setNodes]);

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

export default React.memo(AddressOverview);
