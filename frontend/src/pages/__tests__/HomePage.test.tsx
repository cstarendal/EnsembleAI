import { render, screen, waitFor, fireEvent, act } from "../../test/testUtils";
import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import HomePage from "../HomePage";
import { useResearchStore } from "../../stores/researchStore";

class MockEventSource {
  public url: string;
  public onmessage: null | (() => void) = null;
  public onerror: null | (() => void) = null;
  private listeners: Map<string, Set<() => void>> = new Map();

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

  public close(): void {
    // no-op
  }

  public emit(type: string): void {
    const listeners = this.listeners.get(type);
    if (!listeners) return;
    for (const listener of listeners) {
      listener();
    }
  }
}

describe("HomePage", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let lastEventSource: MockEventSource | null = null;

  beforeEach(() => {
    useResearchStore.getState().clearSession();

    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    lastEventSource = null;
    globalThis.EventSource = vi.fn((url: string) => {
      lastEventSource = new MockEventSource(url);
      return lastEventSource as unknown as EventSource;
    }) as unknown as typeof EventSource;

    vi.clearAllMocks();
  });

  afterEach(() => {
    lastEventSource = null;
  });

  it("renders the start research form initially", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /start research/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start research/i })).toBeInTheDocument();
  });

  it("submits a question and renders timeline + answer when session data is available", async () => {
    const sessionId = "test-session-1";
    const answerText = "This is the final answer.";

    mockFetch.mockImplementation(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/api/sessions") && init?.method === "POST") {
        return {
          ok: true,
          status: 200,
          json: async () => ({ sessionId }),
        } as Response;
      }

      if (url.endsWith(`/api/sessions/${sessionId}`)) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: sessionId,
            question: "What is the impact of policy X?",
            status: "complete",
            messages: [],
            answer: answerText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      } as Response;
    });

    render(<HomePage />);

    const textarea = screen.getByLabelText(/research question/i);
    fireEvent.change(textarea, { target: { value: "What is the impact of policy X?" } });
    fireEvent.click(screen.getByRole("button", { name: /start research/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sessions",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /research timeline/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /research answer/i })).toBeInTheDocument();
      expect(screen.getByText(answerText)).toBeInTheDocument();
    });

    // Ensure we wired up SSE subscription for the session.
    expect(lastEventSource?.url).toContain(`/api/sessions/${sessionId}/stream`);

    // Simulate completion event (optional sanity).
    act(() => {
      lastEventSource?.emit("complete");
    });
  });
});
