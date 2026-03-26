import { AuthButton } from "@/components/auth-button";
import Logo from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
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
            <div className="flex justify-between items-center gap-10">
              <div className="flex gap-5 items-center font-semibold">
                <Link href={"/home"}>
                  <div className="flex justify-center items-center gap-2">
                    <Logo size={32} />
                    <div className="flex items-end gap-1">
                      <p className="font-medium text-xl leading-none">
                        ProjectAsobi
                      </p>
                      <p className="text-xs inline leading-none">
                        v{process.env.NEXT_PUBLIC_APP_VERSION}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="flex gap-5">
                <Link className="font-medium text-sm" href={"/home"}>
                  Characters
                </Link>
                <Link className="font-medium text-sm" href={"/home/session"}>
                  Campaign Planner
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <ThemeModeToggle /> */}
              <AuthButton />
            </div>
          </div>
        </nav>
        <div>{children}</div>
        <footer className="w-full flex items-center justify-center mx-auto text-center text-xs gap-8 py-8">
          <p>
            Built by{" "}
            <a
              href="#"
              // target="_blank"
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
