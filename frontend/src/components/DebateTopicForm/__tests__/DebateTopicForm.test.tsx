import { render, screen, waitFor, fireEvent } from "../../../test/testUtils";
import { expect, describe, it, vi, beforeEach } from "vitest";
import DebateTopicForm from "../DebateTopicForm";

describe("DebateTopicForm", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
    vi.clearAllMocks();
  });

  it("renders form with topic input and submit button", () => {
    render(<DebateTopicForm />);
    expect(screen.getByLabelText(/debate topic/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start debate/i })).toBeInTheDocument();
  });

  it("validates topic is required", async () => {
    render(<DebateTopicForm />);
    const submitButton = screen.getByRole("button", { name: /start debate/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/topic is required/i)).toBeInTheDocument();
    });
  });

  it("validates topic minimum length", async () => {
    render(<DebateTopicForm />);
    const input = screen.getByLabelText(/debate topic/i);
    const submitButton = screen.getByRole("button", { name: /start debate/i });

    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/topic must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it("validates topic maximum length", async () => {
    render(<DebateTopicForm />);
    const input = screen.getByLabelText(/debate topic/i);
    const submitButton = screen.getByRole("button", { name: /start debate/i });

    const longTopic = "a".repeat(1001);
    fireEvent.change(input, { target: { value: longTopic } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/topic must be at most 1000 characters/i)).toBeInTheDocument();
    });
  });

  it("submits valid topic and calls API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: "test-session-123", status: "debating" }),
    } as Response);

    render(<DebateTopicForm />);
    const input = screen.getByLabelText(/debate topic/i);
    const submitButton = screen.getByRole("button", { name: /start debate/i });

    const topic = "What are the effects of universal basic income?";
    fireEvent.change(input, { target: { value: topic } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sessions"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({ topic }),
        })
      );
    });
  });

  it("displays error message on API failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal server error" }),
    } as Response);

    render(<DebateTopicForm />);
    const input = screen.getByLabelText(/debate topic/i);
    const submitButton = screen.getByRole("button", { name: /start debate/i });

    fireEvent.change(input, {
      target: { value: "What are the effects of universal basic income?" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to start debate session/i)).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting", async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    mockFetch.mockReturnValueOnce(fetchPromise);

    render(<DebateTopicForm />);
    const input = screen.getByLabelText(/debate topic/i);
    const submitButton = screen.getByRole("button", { name: /start debate/i });

    fireEvent.change(input, {
      target: { value: "What are the effects of universal basic income?" },
    });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    resolveFetch!({
      ok: true,
      json: async () => ({ sessionId: "test-session-123", status: "debating" }),
    } as Response);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
