import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { SearchSidebar } from "@/components/search-sidebar";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const currentUserId = data.claims.sub;
  if (!currentUserId) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-row bg-card">
      <div className="w-full">
        <nav className="w-full flex justify-center h-16">
          <div className="w-full max-w-screen-2xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link className="font-medium text-xl" href={"/home"}>
                ProjectAsobi{" "}
                <p className="text-xs inline">
                  v{process.env.NEXT_PUBLIC_APP_VERSION}
                </p>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeModeToggle />
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
          </div>
        </nav>
        <div>{children}</div>
        <footer className="w-full flex items-center justify-center mx-auto text-center text-xs gap-8 py-8">
          <p>
            Built by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              NoodleSpot.dev
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
      {/* <div>
        <SearchSidebar />
      </div> */}
    </main>
  );
}
