// app/invite/[token]/page.tsx
// import { acceptInvite } from "@/app/actions/invites";
import { createServerClient } from "@supabase/ssr";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  //   const supabase = createServerClient(...)

  // Preview the session info before accepting
  // const { data: invite } = await supabase
  //   .from("session_invites")
  //   .select("session_id, expires_at, group_sessions(name)")
  //   .eq("token", params.token)
  //   .single();

  // if (!invite) return <p>Invalid or expired invite.</p>;

  return (
    <div>
      {/* <h1>You've been invited to {invite.group_sessions.name}</h1>
      <p>Expires {new Date(invite.expires_at).toLocaleDateString()}</p>

      <form action={acceptInvite.bind(null, params.token)}>
        <button type="submit">Accept Invite</button>
      </form> */}
    </div>
  );
}
