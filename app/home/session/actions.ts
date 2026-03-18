"use server";

import {
  createSession,
  getSessionById,
  listSessions,
  updateSessionFlowById,
  updateSessionNameById,
} from "@/api/sessions";
import { createClient } from "@/lib/supabase/server";
import type { SessionFlowData } from "@/types/session-flow";
import { redirect } from "next/navigation";

export async function createSessionAction() {
  const { sessionId } = await createSession();

  if (sessionId) return redirect(`/home/session/${sessionId}`);
}

export async function listSessionsAction(userId: string | undefined) {
  if (!userId) {
    redirect("/auth/login");
  }

  return listSessions(userId);
}

export async function getSessionByIdAction(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !data?.claims || !userId) {
    redirect("/auth/login");
  }

  return getSessionById(sessionId, userId);
}

export async function updateSessionFlowAction(
  sessionId: string,
  flowData: SessionFlowData,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !data?.claims || !userId) {
    redirect("/auth/login");
  }

  return updateSessionFlowById(sessionId, userId, flowData);
}

export async function updateSessionNameAction(sessionId: string, name: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !data?.claims || !userId) {
    redirect("/auth/login");
  }

  return updateSessionNameById(sessionId, userId, name);
}
