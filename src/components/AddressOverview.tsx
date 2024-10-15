// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BaseAccount } from '@mimir-wallet/safe/types';

import dagre from '@dagrejs/dagre';
import React, { useEffect } from 'react';
import ReactFlow, {
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  useEdgesState,
  useNodesState
} from 'reactflow';

import { EmptyArray } from '@mimir-wallet/constants';

import AddressCell from './AddressCell';

interface Props {
  account: BaseAccount;
}

type NodeData = { parentId: string | null; name?: string | null; members: BaseAccount[]; address: string };

const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

export function getLayoutedElements(nodes: Node[], edges: Edge[], nodeWidth = 260, nodeHeight = 55, direction = 'RL') {
  const isHorizontal = direction === 'LR';

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
}

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
    makeNodes(_account, nodeId, nodes, edges);
  });
}

function AddressOverview({ account }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const initialNodes: Node<NodeData>[] = [];
    const initialEdges: Edge[] = [];

    makeNodes(account, null, initialNodes, initialEdges);

    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges);

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
    >
      <MiniMap pannable zoomable />
      <Controls />
    </ReactFlow>
  );
}

export default React.memo(AddressOverview);
