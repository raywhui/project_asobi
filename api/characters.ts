import {
  blankInitialCharacterSheet,
  CharacterSheetState,
} from "@/data/dnd-character-sheet";
import { createClient } from "@/lib/supabase/server";

/**
 *
 * @param userId string
 * @returns
 */
export async function createCharacterFromTemplate(userId: string | undefined) {
  const supabase = await createClient();
  const templateData = structuredClone(blankInitialCharacterSheet);

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: userId,
      data: templateData,
    })
    .select("charId:char_id")
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function listCharacters(userId: string, limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("characters")
    .select(`charId:char_id, data->character->name`)
    .eq("user_id", userId)
    .order("data->character->name", { ascending: true });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query.overrideTypes<Array<{ name: string }>>();

  if (error) throw new Error(error.message);

  return data;
}

export async function getCharacterById(charId: string) {
  const supabase = await createClient();

  let { data, error } = await supabase
    .from("characters")
    .select("charId:char_id, data, playerNotes:player_notes")
    .eq("char_id", charId)
    .single()
    .overrideTypes<{ data: CharacterSheetState }>();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateCharacterById(
  charId: string,
  sheet: CharacterSheetState,
) {
  const supabase = await createClient();

  let { data, error } = await supabase
    .from("characters")
    .update({ data: sheet })
    .eq("char_id", charId);

  if (error) throw new Error(error.message);

  return data;
}

export async function updatePlayerNotesById(charId: string, value: string) {
  const supabase = await createClient();

  let { data, error } = await supabase
    .from("characters")
    .update({ player_notes: value })
    .eq("char_id", charId);

  if (error) throw new Error(error.message);

  return data;
}
