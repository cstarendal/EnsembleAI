import { useState, useEffect, useCallback } from "react";
import type { Session } from "../types/session";

export function useResearchSession(sessionId: string | null): {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (id: string): Promise<Session> => {
    const result = await fetch(`/api/sessions/${id}`);
    if (!result.ok) {
      throw new Error("Failed to fetch session");
    }
    return result.json();
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const eventSource = new EventSource(`/api/sessions/${sessionId}/stream`);

    eventSource.onmessage = () => {
      fetchSession(sessionId).then(setSession).catch(setError);
    };

    eventSource.addEventListener("status", () => {
      fetchSession(sessionId).then(setSession).catch(setError);
    });

    eventSource.addEventListener("plan", () => {
      fetchSession(sessionId).then(setSession).catch(setError);
    });

    eventSource.addEventListener("sources", () => {
      fetchSession(sessionId).then(setSession).catch(setError);
    });

    eventSource.addEventListener("answer", () => {
      fetchSession(sessionId).then(setSession).catch(setError);
    });

    eventSource.addEventListener("complete", () => {
      fetchSession(sessionId).then(setSession).catch(setError);
      setIsLoading(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setIsLoading(false);
      eventSource.close();
    };

    fetchSession(sessionId).then(setSession).catch(setError);

    return () => {
      eventSource.close();
    };
  }, [sessionId, fetchSession]);

  return { session, isLoading, error };
}
