import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { DashboardSearchSidebar } from "@/components/dashboard-search-sidebar";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen flex flex-col items-center">
      {children}
    </section>
  );
}
