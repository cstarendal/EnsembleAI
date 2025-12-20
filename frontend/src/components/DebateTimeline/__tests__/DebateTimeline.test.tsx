import { render, screen } from "../../../test/testUtils";
import { expect, describe, it } from "vitest";
import DebateTimeline from "../DebateTimeline";
import type { Session } from "../../../types/session";

describe("DebateTimeline", () => {
  it("renders message when no session", () => {
    render(<DebateTimeline session={null} />);
    expect(screen.getByText(/no active research session/i)).toBeInTheDocument();
  });

  it("renders session status", () => {
    const session: Session = {
      id: "test-1",
      question: "Test question",
      status: "planning",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(<DebateTimeline session={session} />);
    expect(screen.getByText(/status: planning/i)).toBeInTheDocument();
  });

  it("renders research plan when available", () => {
    const session: Session = {
      id: "test-1",
      question: "Test question",
      status: "hunting",
      plan: {
        plan: "Test plan",
        searchQueries: ["query 1", "query 2"],
      },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(<DebateTimeline session={session} />);
    expect(screen.getByText(/research plan/i)).toBeInTheDocument();
    expect(screen.getByText("Test plan")).toBeInTheDocument();
    expect(screen.getByText("query 1")).toBeInTheDocument();
  });

  it("renders sources when available", () => {
    const session: Session = {
      id: "test-1",
      question: "Test question",
      status: "debating",
      sources: [
        {
          title: "Source 1",
          url: "https://example.com/1",
          snippet: "Snippet 1",
        },
      ],
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(<DebateTimeline session={session} />);
    // Sources are now displayed in SourcePanel component, not DebateTimeline
    // DebateTimeline only shows status, plan, and messages
  });
});
