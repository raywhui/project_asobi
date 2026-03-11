import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
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
