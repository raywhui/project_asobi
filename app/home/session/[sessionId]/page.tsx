import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CampaignFlow from "@/components/campaign-flow";
import { type Edge, type Node, MarkerType } from "@xyflow/react";
import {
  getSessionByIdAction,
  updateSessionFlowAction,
  updateSessionNameAction,
} from "../actions";

const fallbackNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    data: {
      name: "Jane Doe",
      job: "CEO",
      emoji: "😎",
      note: "This is a test note",
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "custom",
    data: {
      name: "Tyler Weary",
      job: "Designer",
      emoji: "🤓",
      note: "This is a test note 2",
    },
    position: { x: 0, y: 200 },
  },
  {
    id: "3",
    type: "custom",
    data: {
      name: "Kristi Price",
      job: "Developer",
      emoji: "🤩",
      note: "This is a test note 3",
    },
    position: { x: 0, y: 400 },
  },
];

const fallbackEdges: Edge[] = [
  {
    id: "1",
    source: "1",
    target: "2",
    label: "leads to",
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "2",
    source: "2",
    target: "3",
    label: "if dead",
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export default async function SessionPage({
  params,
}: {
  params: Promise<{
    sessionId: string;
  }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const session = await getSessionByIdAction(sessionId).catch(() => null);
  if (!session) {
    notFound();
  }

  const initialNodes = session.flowData?.nodes ?? fallbackNodes;
  const initialEdges = session.flowData?.edges ?? fallbackEdges;
  const initialNotes = session.flowData?.notes ?? "";
  const initialSessionName = session.sessionName ?? "Untitled Campaign";

  return (
    <div className="flex flex-row min-h-[90dvh]">
      <div className="bg-card w-full mx-4">
        <CampaignFlow
          sessionId={sessionId}
          initialSessionName={initialSessionName}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          initialNotes={initialNotes}
          onSaveFlow={updateSessionFlowAction}
          onSaveSessionName={updateSessionNameAction}
        />
      </div>
    </div>
  );
}
