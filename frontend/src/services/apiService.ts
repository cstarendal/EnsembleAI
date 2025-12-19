import type { Session } from "../types/session";

export interface CreateSessionResponse {
  sessionId: string;
}

interface JsonHttpResult {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

async function parseJsonOrThrow<T>(result: JsonHttpResult): Promise<T> {
  if (!result.ok) {
    throw new Error(`Call failed (${result.status})`);
  }
  return (await result.json()) as T;
}

export async function createSession(question: string): Promise<CreateSessionResponse> {
  const result = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return parseJsonOrThrow<CreateSessionResponse>(result);
}

export async function getSession(sessionId: string): Promise<Session> {
  const result = await fetch(`/api/sessions/${sessionId}`);
  return parseJsonOrThrow<Session>(result);
}

export function getSessionStream(sessionId: string): EventSource {
  return new EventSource(`/api/sessions/${sessionId}/stream`);
}
