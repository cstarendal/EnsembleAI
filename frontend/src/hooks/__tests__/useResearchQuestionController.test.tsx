import { renderHook, act, waitFor } from "@testing-library/react";
import type { ChangeEvent, FormEvent } from "react";
import { expect, describe, it, vi, beforeEach } from "vitest";

vi.mock("../../services/apiService", () => ({
  createSession: vi.fn(),
}));

import { useResearchQuestionController } from "../useResearchQuestionController";
import { createSession } from "../../services/apiService";

function makeSubmitEvent(): FormEvent<HTMLFormElement> {
  return { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
}

function makeChangeEvent(value: string): ChangeEvent<HTMLTextAreaElement> {
  return { target: { value } } as unknown as ChangeEvent<HTMLTextAreaElement>;
}

describe("useResearchQuestionController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates question is required", async () => {
    const { result } = renderHook(() => useResearchQuestionController({}));

    await act(async () => {
      await result.current.handleSubmit(makeSubmitEvent());
    });

    expect(result.current.error).toBe("Question is required");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("validates question minimum length", async () => {
    const { result } = renderHook(() => useResearchQuestionController({}));

    act(() => {
      result.current.handleChange(makeChangeEvent("ab"));
    });

    await act(async () => {
      await result.current.handleSubmit(makeSubmitEvent());
    });

    expect(result.current.error).toBe("Question must be at least 10 characters");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("validates question maximum length", async () => {
    const { result } = renderHook(() => useResearchQuestionController({}));

    act(() => {
      result.current.handleChange(makeChangeEvent("a".repeat(1001)));
    });

    await act(async () => {
      await result.current.handleSubmit(makeSubmitEvent());
    });

    expect(result.current.error).toBe("Question must be at most 1000 characters");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("submits valid question, calls API, and invokes onSubmit", async () => {
    const onSubmit = vi.fn();
    (createSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      sessionId: "test-session-123",
    });

    const { result } = renderHook(() => useResearchQuestionController({ onSubmit }));

    act(() => {
      result.current.handleChange(makeChangeEvent("What are the effects of universal basic income?"));
    });

    await act(async () => {
      await result.current.handleSubmit(makeSubmitEvent());
    });

    expect(createSession).toHaveBeenCalledWith("What are the effects of universal basic income?");
    expect(onSubmit).toHaveBeenCalledWith("test-session-123");
    expect(result.current.question).toBe("");
  });

  it("sets isSubmitting while request is in flight", async () => {
    const onSubmit = vi.fn();
    let resolve: (value: { sessionId: string }) => void;
    const pending = new Promise<{ sessionId: string }>((r) => {
      resolve = r;
    });

    (createSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue(pending);

    const { result } = renderHook(() => useResearchQuestionController({ onSubmit }));

    act(() => {
      result.current.handleChange(makeChangeEvent("What are the effects of universal basic income?"));
    });

    act(() => {
      result.current.handleSubmit(makeSubmitEvent());
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolve!({ sessionId: "s-1" });
      await pending;
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  it("sets user-friendly error message on API failure", async () => {
    (createSession as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useResearchQuestionController({}));

    act(() => {
      result.current.handleChange(makeChangeEvent("What are the effects of universal basic income?"));
    });

    await act(async () => {
      await result.current.handleSubmit(makeSubmitEvent());
    });

    expect(result.current.error).toBe("Failed to start research session");
  });
});

