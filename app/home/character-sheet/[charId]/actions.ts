"use server";

import { updateCharacterById, updatePlayerNotesById } from "@/api/characters";
import { CharacterSheetState } from "@/data/dnd-character-sheet";

export async function updateCharacter(
  charId: string,
  sheet: CharacterSheetState,
) {
  const data = await updateCharacterById(charId, sheet);
  return data;
}

export async function updatePlayerNotes(charId: string, value: string) {
  const data = await updatePlayerNotesById(charId, value);
  return data;
}
