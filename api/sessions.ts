import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";
import type { SessionFlowData } from "@/types/session-flow";

export async function createSession() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .insert({ name: "Upon My Name as Godfrey" })
    .select("sessionId:session_id")
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function listSessions(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("sessionId:session_id, name")
    .eq("created_by", userId);

  if (error) throw new Error(error.message);

  console.log("session data: ", data);

  return data;
}

export async function getSessionById(sessionId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("sessionId:session_id, sessionName:name, flowData:flow_data")
    .eq("session_id", sessionId)
    .eq("created_by", userId)
    .single()
    .overrideTypes<{
      sessionName: string | null;
      flowData: SessionFlowData | null;
    }>();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateSessionFlowById(
  sessionId: string,
  userId: string,
  flowData: SessionFlowData,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .update({ flow_data: flowData as unknown as Json })
    .eq("session_id", sessionId)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);

  return data;
}

export async function updateSessionNameById(
  sessionId: string,
  userId: string,
  name: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .update({ name })
    .eq("session_id", sessionId)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);

  return data;
}

// const invitedMembers = [
//     ...inviteeIds.map((id) => ({
//       session_id: session.id,
//       user_id: id,
//       status: "pending",
//     })),
//   ];

//   await supabase.from("session_members").insert(invitedMembers);
