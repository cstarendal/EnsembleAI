import { renderHook, waitFor, act } from "@testing-library/react";
import { expect, describe, it, vi, beforeEach } from "vitest";
import type { Session } from "../../types/session";

vi.mock("../../services/apiService", () => ({
  getSession: vi.fn(),
  getSessionStream: vi.fn(),
}));

import { useDebateSession } from "../useDebateSession";
import { getSession, getSessionStream } from "../../services/apiService";

class MockEventSource {
  public url: string;
  public onmessage: null | (() => void) = null;
  public onerror: null | (() => void) = null;
  private listeners: Map<string, Set<() => void>> = new Map();
  public close = vi.fn();

  public constructor(url: string) {
    this.url = url;
  }

  public addEventListener(type: string, listener: () => void): void {
    const existing = this.listeners.get(type);
    if (existing) {
      existing.add(listener);
      return;
    }
    this.listeners.set(type, new Set([listener]));
  }

  public emit(type: string): void {
    const listeners = this.listeners.get(type);
    if (!listeners) return;
    for (const listener of listeners) {
      listener();
    }
  }
}

describe("useDebateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null session when sessionId is null", () => {
    const { result } = renderHook(() => useDebateSession(null));
    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
    expect(getSessionStream).not.toHaveBeenCalled();
  });

  it("fetches session on mount and subscribes to stream", async () => {
    const sessionId = "s-1";
    const session: Session = {
      id: sessionId,
      topic: "Test topic",
      status: "debating",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockStream = new MockEventSource(`/api/sessions/${sessionId}/stream`);
    (getSessionStream as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);
    (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);

    const { result } = renderHook(() => useDebateSession(sessionId));

    await waitFor(() => {
      expect(result.current.session?.id).toBe(sessionId);
    });

    expect(getSessionStream).toHaveBeenCalledWith(sessionId);
    expect(getSession).toHaveBeenCalledWith(sessionId);
    expect(result.current.isLoading).toBe(true);
  });

  it("re-fetches session when a stream message arrives", async () => {
    const sessionId = "s-2";
    const session: Session = {
      id: sessionId,
      topic: "Test topic",
      status: "debating",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockStream = new MockEventSource(`/api/sessions/${sessionId}/stream`);
    (getSessionStream as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);
    (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);

    const { result } = renderHook(() => useDebateSession(sessionId));

    await waitFor(() => {
      expect(result.current.session?.id).toBe(sessionId);
    });

    (getSession as unknown as ReturnType<typeof vi.fn>).mockClear();

    act(() => {
      mockStream.onmessage?.();
    });

    await waitFor(() => {
      expect(getSession).toHaveBeenCalledWith(sessionId);
    });
  });

  it("closes EventSource on unmount", async () => {
    const sessionId = "s-3";
    const session: Session = {
      id: sessionId,
      topic: "Test topic",
      status: "debating",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockStream = new MockEventSource(`/api/sessions/${sessionId}/stream`);
    (getSessionStream as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);
    (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);

    const { unmount } = renderHook(() => useDebateSession(sessionId));

    await waitFor(() => {
      expect(getSession).toHaveBeenCalledWith(sessionId);
    });

    unmount();
    expect(mockStream.close).toHaveBeenCalledTimes(1);
  });

  it("exposes error when fetching session fails", async () => {
    const sessionId = "s-4";
    const mockStream = new MockEventSource(`/api/sessions/${sessionId}/stream`);
    (getSessionStream as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);
    (getSession as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Boom"));

    const { result } = renderHook(() => useDebateSession(sessionId));

    await waitFor(() => {
      expect(result.current.error).toBe("Boom");
    });
  });
});
