import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DndCharacterSheet } from "@/components/dnd-character-sheet";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div>
      <DndCharacterSheet />
    </div>
  );
}
