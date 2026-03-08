import { redirect } from "next/navigation";

import { createCharacterFromTemplate, listCharacters } from "@/api/characters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

async function listCharactersAction(userId: string | undefined) {
  "use server";

  if (!userId) {
    redirect("/auth/login");
  }

  return listCharacters(userId);
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !data?.claims?.sub || !userId) {
    redirect("/auth/login");
  }

  const characters = await listCharactersAction(userId);

  console.log(characters);

  async function createCharacterAction() {
    "use server";
    const { charId } = await createCharacterFromTemplate(userId);
    if (charId) return redirect(`/home/character-sheet/${charId}`);
  }

  return (
    <div className="w-full max-w-3xl space-y-6 min-h-[75vh]">
      <h1 className="text-2xl font-medium">Welcome to ProjectAsobi</h1>
      <p className="text-base">
        ProjectAsobi is a basic character sheet builder for Dungeons & Dragons.
        Built because other services either required payment or were not very
        intuitive. This application aims to create a character sheet that can be
        customized and organized to the player's specification. May or not
        maintain this.
      </p>
      <h2 className="text-xl font-medium">Let's get started:</h2>
      <div className="grid grid-cols-2 justify-center items-stretch gap-4">
        {characters.length > 0 && (
          <Card className="w-full col-span-2 justify-between">
            <CardHeader>
              <CardTitle>Player Characters</CardTitle>
              <CardDescription>
                Select an existing character you made.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {characters.map(({ charId, name }) => (
                  <li key={charId}>
                    <Link
                      className="inline"
                      href={`/home/character-sheet/${charId}`}
                    >
                      <p className="inline hover:bg-stone-500 rounded">
                        {name}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        <Card className="w-full flex justify-between">
          <CardHeader>
            <CardTitle>Create New Character</CardTitle>
            <CardDescription>
              Making a new character from scratch. Currently only able to fill
              in the sheets. Dynamic character creation and homebrew coming
              soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCharacterAction}>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="w-full flex justify-between">
          <CardHeader>
            <CardTitle>DM Mode</CardTitle>
            <CardDescription>
              Features for running a live session. Coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <form>
              <Button type="submit" className="w-full" disabled>
                <BookOpen className="w-4 h-4" />
                Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
