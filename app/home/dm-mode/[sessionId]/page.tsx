import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CampaignFlow from "@/components/campaign-flow";
import { Sidebar } from "@/components/ui/sidebar";
import PlayerNotes from "@/components/search-sidebar/player-notes";
import CampaignNotes from "@/components/campaign-flow/campaign-notes";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { type Edge, type Node, MarkerType } from "@xyflow/react";

async function campaignNotesAction(val: string) {
  "use server";

  console.log("val: ", val);
}

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

  const initialNodes: Node[] = [
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

  const initialEdges: Edge[] = [
    {
      id: "1-2",
      source: "1",
      target: "2",
      label: "leads to",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed, // filled arrowhead
      },
    },
    {
      id: "2-3",
      source: "2",
      target: "3",
      label: "if dead",
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed, // filled arrowhead
      },
    },
  ];

  //   const character = await getCharacterById(charId);
  //   if (!character?.data) {
  //     notFound();
  //   }

  return (
    <div className="flex flex-row min-h-[90dvh]">
      <div className="bg-card w-full mx-4">
        <CampaignFlow
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          campaignNotesOnSave={campaignNotesAction}
        />
      </div>
    </div>
  );
}
