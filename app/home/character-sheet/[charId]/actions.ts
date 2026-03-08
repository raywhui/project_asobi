"use server";

import { updateCharacterById } from "@/api/characters";
import { CharacterSheetState } from "@/data/dnd-character-sheet";

export async function updateCharacter(
  charId: string,
  sheet: CharacterSheetState,
) {
  const data = await updateCharacterById(charId, sheet);
  return data;
}
