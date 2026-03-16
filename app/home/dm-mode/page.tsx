import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { createSessionAction, listSessionsAction } from "./actions";
import Link from "next/link";
// import { listSessions } from "@/api/groupSession";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DMModePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !data?.claims?.sub || !userId) {
    redirect("/auth/login");
  }

  const sessions = await listSessionsAction(userId);

  return (
    <div className="w-full flex flex-row justify-center px-4 py-6 rounded-3xl bg-background">
      <div className="w-full max-w-3xl space-y-6 min-h-[75vh]">
        <h1 className="text-2xl font-medium">DM Mode</h1>
        <p className="text-base">Live Session Moderation Tools.</p>
        <h2 className="text-xl font-medium">Let's get started:</h2>
        {sessions.length > 0 && (
          <Card className="w-full col-span-2 justify-between">
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>
                Select an existing session you made.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {sessions.map(({ sessionId, name }) => (
                  <li key={sessionId}>
                    <Link
                      className="inline"
                      href={`/home/dm-mode/${sessionId}`}
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
        <div className="grid grid-cols-2 justify-center items-stretch gap-4">
          <Card className="w-full flex justify-between">
            <CardHeader>
              <CardTitle>Create A New Group</CardTitle>
              {/* <CardDescription>
                Make a new character from scratch. Currently only able to fill
                in fields on a blank sheet. Dynamic character creation and
                homebrews coming soon.
              </CardDescription> */}
            </CardHeader>
            <CardContent>
              <Button
                type="submit"
                className="w-full"
                onClick={createSessionAction}
              >
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </CardContent>
          </Card>
          <Card className="w-full flex justify-between">
            <CardHeader>
              <CardTitle>Create a new group</CardTitle>
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
    </div>
  );
}
