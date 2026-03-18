import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function Home() {
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (typeof userId === "string" && userId.length > 0) {
      redirect(`/home`);
    } else {
      return redirect("auth/login");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <p>
        how did u get here? this should've redirected you to the login page.
        nice to meet u btw.
      </p>
    </main>
  );
}
