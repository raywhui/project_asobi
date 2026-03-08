import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DndCharacterSheet } from "@/components/dnd-character-sheet";
import { getCharacterById } from "@/api/characters";
import { updateCharacter } from "./actions";

export default async function CharSheetPage({
  params,
}: {
  params: Promise<{
    charId: string;
  }>;
}) {
  const { charId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const character = await getCharacterById(charId);
  if (!character?.data) {
    notFound();
  }

  return (
    <div>
      <DndCharacterSheet
        userCharacterData={character.data}
        charId={charId}
        onSave={updateCharacter}
      />
    </div>
  );
}
