import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !data?.claims?.sub) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1>Welcome to PROJECT_ASOBI {userId}</h1>
    </div>
  );
}
