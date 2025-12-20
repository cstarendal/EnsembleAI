import { render, screen, waitFor, fireEvent } from "../../../test/testUtils";
import { expect, describe, it, vi, beforeEach } from "vitest";
import ResearchQuestionForm from "../ResearchQuestionForm";

describe("ResearchQuestionForm", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
    vi.clearAllMocks();
  });

  it("renders form with question input and submit button", () => {
    render(<ResearchQuestionForm />);
    expect(screen.getByLabelText(/research question/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start research/i })).toBeInTheDocument();
  });

  it("validates question is required", async () => {
    render(<ResearchQuestionForm />);
    const submitButton = screen.getByRole("button", { name: /start research/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/question is required/i)).toBeInTheDocument();
    });
  });

  it("validates question minimum length", async () => {
    render(<ResearchQuestionForm />);
    const input = screen.getByLabelText(/research question/i);
    const submitButton = screen.getByRole("button", { name: /start research/i });

    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/question must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it("validates question maximum length", async () => {
    render(<ResearchQuestionForm />);
    const input = screen.getByLabelText(/research question/i);
    const submitButton = screen.getByRole("button", { name: /start research/i });

    const longQuestion = "a".repeat(1001);
    fireEvent.change(input, { target: { value: longQuestion } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/question must be at most 1000 characters/i)).toBeInTheDocument();
    });
  });

  it("submits valid question and calls API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: "test-session-123", status: "planning" }),
    } as Response);

    render(<ResearchQuestionForm />);
    const input = screen.getByLabelText(/research question/i);
    const submitButton = screen.getByRole("button", { name: /start research/i });

    const question = "What are the effects of universal basic income?";
    fireEvent.change(input, { target: { value: question } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sessions"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({ question }),
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

    render(<ResearchQuestionForm />);
    const input = screen.getByLabelText(/research question/i);
    const submitButton = screen.getByRole("button", { name: /start research/i });

    fireEvent.change(input, {
      target: { value: "What are the effects of universal basic income?" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to start research session/i)).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting", async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    mockFetch.mockReturnValueOnce(fetchPromise);

    render(<ResearchQuestionForm />);
    const input = screen.getByLabelText(/research question/i);
    const submitButton = screen.getByRole("button", { name: /start research/i });

    fireEvent.change(input, {
      target: { value: "What are the effects of universal basic income?" },
    });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    resolveFetch!({
      ok: true,
      json: async () => ({ sessionId: "test-session-123", status: "planning" }),
    } as Response);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
