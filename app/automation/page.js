"use client";

import DashboardLayout from "../dashboard-layout";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from "react";

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Receive Message' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Check Keywords' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    data: { label: 'Send Auto Reply' },
    position: { x: 250, y: 250 },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'End Flow' },
    position: { x: 400, y: 350 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function AutomationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold mb-4">Automation</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-medium">Automation Flow Builder</h2>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-base font-medium">
              Save Flow
            </button>
          </div>
          <FlowCanvas />
        </div>
      </div>
    </DashboardLayout>
  );
}