import { createClient } from "@/lib/supabase/server";

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

// const invitedMembers = [
//     ...inviteeIds.map((id) => ({
//       session_id: session.id,
//       user_id: id,
//       status: "pending",
//     })),
//   ];

//   await supabase.from("session_members").insert(invitedMembers);
