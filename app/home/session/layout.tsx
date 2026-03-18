import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DMModeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="min-h-screen">{children}</section>;
}
