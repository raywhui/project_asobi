import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <h1>Welcome to PROJECT_ASOBI {userId}</h1>;
}
