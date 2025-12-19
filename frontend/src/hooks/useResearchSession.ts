import { useState, useEffect, useCallback } from "react";
import type { Session } from "../types/session";
import { getSession, getSessionStream } from "../services/apiService";

export function useResearchSession(sessionId: string | null): {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (id: string): Promise<Session> => getSession(id), []);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const eventSource = getSessionStream(sessionId);

    const handleFetchError = (err: unknown): void => {
      setError(err instanceof Error ? err.message : "Unknown error");
    };

    eventSource.onmessage = () => {
      fetchSession(sessionId).then(setSession).catch(handleFetchError);
    };

    eventSource.addEventListener("status", () => {
      fetchSession(sessionId).then(setSession).catch(handleFetchError);
    });

    eventSource.addEventListener("plan", () => {
      fetchSession(sessionId).then(setSession).catch(handleFetchError);
    });

    eventSource.addEventListener("sources", () => {
      fetchSession(sessionId).then(setSession).catch(handleFetchError);
    });

    eventSource.addEventListener("answer", () => {
      fetchSession(sessionId).then(setSession).catch(handleFetchError);
    });

    eventSource.addEventListener("complete", () => {
      fetchSession(sessionId).then(setSession).catch(handleFetchError);
      setIsLoading(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setIsLoading(false);
      eventSource.close();
    };

    fetchSession(sessionId).then(setSession).catch(handleFetchError);

    return () => {
      eventSource.close();
    };
  }, [sessionId, fetchSession]);

  return { session, isLoading, error };
}
