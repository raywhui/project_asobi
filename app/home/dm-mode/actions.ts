"use server";

import { createSession, listSessions } from "@/api/groupSession";
import { redirect } from "next/navigation";

export async function createSessionAction() {
  const { sessionId } = await createSession();

  if (sessionId) return redirect(`/home/dm-mode/${sessionId}`);
}

export async function listSessionsAction(userId: string | undefined) {
  if (!userId) {
    redirect("/auth/login");
  }

  return listSessions(userId);
}
