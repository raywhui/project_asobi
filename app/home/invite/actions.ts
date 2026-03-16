// "use server";
// import { createClient } from "@/lib/supabase/server";
// import { createServerClient } from "@supabase/ssr";
// import { redirect } from "next/navigation";

// 1. Generate an invite link
// export async function createInviteLink(sessionId: string) {
//   //   const supabase = createServerClient(...)

//   const supabase = createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const { data: invite, error } = await supabase
//     .from("session_invites")
//     .insert({ session_id: sessionId, created_by: user.id })
//     .select("token")
//     .single();

//   if (error) throw error;

//   return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
// }

// 2. Accept an invite
// export async function acceptInvite(token: string) {
//   // const supabase = createServerClient(...)
//   const supabase = createClient;
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) redirect(`/login?next=/invite/${token}`);

//   // Validate the token
//   const { data: invite, error } = await supabase
//     .from("session_invites")
//     .select("*")
//     .eq("token", token)
//     .single();

//   if (error || !invite) throw new Error("Invalid invite");
//   if (invite.expires_at < new Date().toISOString())
//     throw new Error("Invite expired");
//   if (invite.max_uses && invite.use_count >= invite.max_uses)
//     throw new Error("Invite full");

//   // Add user to session + increment use count
//   const [memberInsert] = await Promise.all([
//     supabase.from("session_members").upsert(
//       {
//         session_id: invite.session_id,
//         user_id: user.id,
//         status: "accepted",
//         joined_at: new Date().toISOString(),
//       },
//       { onConflict: "session_id,user_id" },
//     ),

//     supabase
//       .from("session_invites")
//       .update({ use_count: invite.use_count + 1 })
//       .eq("token", token),
//   ]);

//   if (memberInsert.error) throw memberInsert.error;

//   redirect(`/session/${invite.session_id}`);
// }
