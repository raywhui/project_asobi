"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  BackgroundVariant,
  useNodesState,
  MarkerType,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { CustomEdge } from "./custom-edge";
import { Button } from "../ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import CampaignNotes from "./campaign-notes";
import { Plus, Save } from "lucide-react";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  "custom-edge": CustomEdge,
};

type CampaignFlowProps = {
  initialNodes: Node[];
  initialEdges: Edge[];
  campaignNotesOnSave: (sessionId: string, val: string) => Promise<unknown>;
};

export default function CampaignFlow({
  initialNodes,
  initialEdges,
  campaignNotesOnSave,
}: CampaignFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeNote, setNodeNote] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault(); // blocks the browser's native save dialog
        // handleSave();
        console.log("saved!");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setNodeNote(node.data.note as string);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // const onEdgesChange: OnEdgesChange = useCallback(
  //   (changes) =>
  //     setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
  //   [],
  // );

  useEffect(() => {
    console.log("node changes: ", nodes);
  }, [nodes]);

  useEffect(() => {
    console.log("edges changes: ", edges);
  }, [edges]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const addNode = useCallback(() => {
    setNodes((prev) => [
      ...prev,
      {
        id: `${prev.length + 1}`,
        type: "custom",
        data: {
          name: "Kristi Price asdjfals fhalsk hf",
          job: "Developer",
          emoji: "🤩",
          note: "",
        },
        position: { x: 0, y: prev.length * 100 },
      },
    ]);
  }, [setNodes]);

  // Inject selected state based on selectedNodeId
  const nodesWithSelection = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [nodes, selectedNodeId],
  );

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="rounded-lg bg-card"
    >
      <ResizablePanel defaultSize="50%" className="">
        <div className="w-full h-full text-black bg-background rounded-3xl p-4">
          {/* <div className="flex gap-2">
            
          </div> */}
          <ReactFlow
            nodes={nodesWithSelection}
            edges={edges}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            // onEdgeClick={}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background
              variant={BackgroundVariant.Cross}
              color="#323232"
              gap={40}
            />
            <Controls />
            <Panel position="top-left">
              <Button onClick={addNode}>
                <Plus size={16} />
                Node
              </Button>
            </Panel>
            <Panel position="top-right">
              <Button onClick={() => console.log("save")} variant="secondary">
                <Save size={16} />
                CTRL + S
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="text-primary" />
      <ResizablePanel defaultSize="50%">
        <div className="ml-4">
          <p className="mb-2">Campaign Notes</p>
          <CampaignNotes
            initialValue={nodeNote}
            onSave={campaignNotesOnSave}
            sessionId="123"
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
