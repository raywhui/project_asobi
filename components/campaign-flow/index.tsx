"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  type Node,
  type Edge,
  type OnConnect,
  type EdgeMouseHandler,
  BackgroundVariant,
  useNodesState,
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
import { LoaderPinwheel, Plus, Save } from "lucide-react";
import type { SessionFlowData } from "@/types/session-flow";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  "custom-edge": CustomEdge,
};

type CampaignFlowProps = {
  sessionId: string;
  initialSessionName: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  initialNotes: string;
  onSaveFlow: (
    sessionId: string,
    flowData: SessionFlowData,
  ) => Promise<unknown>;
  onSaveSessionName: (sessionId: string, name: string) => Promise<unknown>;
};

type EditableNodeField = "name" | "job" | "emoji";

export default function CampaignFlow({
  sessionId,
  initialSessionName,
  initialNodes,
  initialEdges,
  initialNotes,
  onSaveFlow,
  onSaveSessionName,
}: CampaignFlowProps) {
  const normalizedInitialEdges = useMemo(
    () =>
      initialEdges.map((edge) => ({
        ...edge,
        type: edge.type ?? "custom-edge",
      })),
    [initialEdges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    normalizedInitialEdges,
  );
  const [sessionName, setSessionName] = useState(initialSessionName);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [prevSessionName, setPrevSessionName] = useState(initialSessionName);
  const [prevFlowData, setPrevFlowData] = useState<SessionFlowData>({
    nodes: initialNodes,
    edges: normalizedInitialEdges,
    notes: initialNotes,
  });

  const flowData = useMemo(
    () => ({
      nodes,
      edges,
      notes,
    }),
    [nodes, edges, notes],
  );

  const hasFlowChanges = useMemo(
    () => JSON.stringify(flowData) !== JSON.stringify(prevFlowData),
    [flowData, prevFlowData],
  );

  const normalizedSessionName = sessionName.trim() || "Untitled Campaign";
  const hasSessionNameChanges = normalizedSessionName !== prevSessionName;

  const hasChanges = hasFlowChanges || hasSessionNameChanges;

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const selectedNodeNote = useMemo(() => {
    if (!selectedNode) return "";
    return typeof selectedNode.data?.note === "string"
      ? selectedNode.data.note
      : "";
  }, [selectedNode]);

  const saveSessionName = useCallback(async () => {
    if (isSavingName || !hasSessionNameChanges) return;

    setIsSavingName(true);
    try {
      await onSaveSessionName(sessionId, normalizedSessionName);
      setSessionName(normalizedSessionName);
      setPrevSessionName(normalizedSessionName);
    } catch (error) {
      console.error("Failed to save session name", error);
    } finally {
      setIsSavingName(false);
    }
  }, [
    hasSessionNameChanges,
    isSavingName,
    normalizedSessionName,
    onSaveSessionName,
    sessionId,
  ]);

  const handleSave = useCallback(async () => {
    if (isSaving || !hasChanges) return;

    setIsSaving(true);
    try {
      if (hasSessionNameChanges) {
        await onSaveSessionName(sessionId, normalizedSessionName);
        setSessionName(normalizedSessionName);
        setPrevSessionName(normalizedSessionName);
      }

      if (hasFlowChanges) {
        await onSaveFlow(sessionId, flowData);
        setPrevFlowData(
          JSON.parse(JSON.stringify(flowData)) as SessionFlowData,
        );
      }
    } catch (error) {
      console.error("Failed to save campaign", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    flowData,
    hasChanges,
    hasFlowChanges,
    hasSessionNameChanges,
    isSaving,
    normalizedSessionName,
    onSaveFlow,
    onSaveSessionName,
    sessionId,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick: EdgeMouseHandler = useCallback((_, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((edgesSnapshot) =>
        addEdge(
          {
            ...params,
            type: "custom-edge",
            label: "",
          },
          edgesSnapshot,
        ),
      );
    },
    [setEdges],
  );

  const addNode = useCallback(() => {
    setNodes((prev) => [
      ...prev,
      {
        id: `${prev.length + 1}`,
        type: "custom",
        data: {
          name: "New Event",
          job: "Event description",
          emoji: "🙂",
          note: "",
        },
        position: { x: 0, y: prev.length * 100 },
      },
    ]);
  }, [setNodes]);

  const updateNodeField = useCallback(
    (nodeId: string, field: EditableNodeField, value: string) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  [field]: value,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const updateSelectedNodeNote = useCallback(
    (value: string) => {
      if (!selectedNodeId) return;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === selectedNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  note: value,
                },
              }
            : node,
        ),
      );
    },
    [selectedNodeId, setNodes],
  );

  const updateEdgeLabel = useCallback(
    (edgeId: string, value: string) => {
      setEdges((prev) =>
        prev.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                label: value,
              }
            : edge,
        ),
      );
    },
    [setEdges],
  );

  const nodesWithSelection = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          onUpdateField: (field: EditableNodeField, value: string) =>
            updateNodeField(node.id, field, value),
        },
      })),
    [nodes, selectedNodeId, updateNodeField],
  );

  const edgesWithSelection = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        selected: edge.id === selectedEdgeId,
        data: {
          ...edge.data,
          onUpdateLabel: (value: string) => updateEdgeLabel(edge.id, value),
        },
      })),
    [edges, selectedEdgeId, updateEdgeLabel],
  );

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="rounded-lg bg-card"
    >
      <ResizablePanel defaultSize="50%" className="">
        <div className="w-full h-full text-black bg-background rounded-3xl p-4">
          <ReactFlow
            nodes={nodesWithSelection}
            edges={edgesWithSelection}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
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
                Event
              </Button>
            </Panel>
            <Panel position="top-right">
              <Button
                onClick={() => void handleSave()}
                variant="secondary"
                disabled={isSaving || !hasChanges}
                className={
                  hasChanges
                    ? "border-primary shadow-[0_0_30px] shadow-primary"
                    : ""
                }
              >
                {isSaving ? (
                  <LoaderPinwheel size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                CTRL + S
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="text-primary" />
      <ResizablePanel defaultSize="50%">
        <div className="ml-4">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2">Campaign Name</p>
              <div className="flex items-center gap-2">
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sessionName}
                  onChange={(event) => setSessionName(event.target.value)}
                  // onBlur={() => void saveSessionName()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveSessionName();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  disabled={isSavingName || !hasSessionNameChanges}
                  onClick={() => void saveSessionName()}
                >
                  {isSavingName ? (
                    <LoaderPinwheel size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Campaign Name
                </Button>
              </div>
            </div>

            {selectedNode && (
              <div>
                <p className="mb-2">
                  {selectedNode.data.name as string} - Event Notes
                </p>
                <CampaignNotes
                  value={selectedNodeNote}
                  onChange={updateSelectedNodeNote}
                />
              </div>
            )}
            <div>
              <p className="mb-2">Campaign Notes</p>
              <CampaignNotes value={notes} onChange={setNotes} />
            </div>
          </div>

          <span className="text-muted-foreground text-xs">
            {isSaving ? "Saving..." : hasChanges ? "Unsaved changes" : "Saved"}
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
