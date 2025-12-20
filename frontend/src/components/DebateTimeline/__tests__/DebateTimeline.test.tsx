import { render, screen } from "../../../test/testUtils";
import { expect, describe, it } from "vitest";
import DebateTimeline from "../DebateTimeline";
import type { Session } from "../../../types/session";

describe("DebateTimeline", () => {
  it("renders message when no session", () => {
    render(<DebateTimeline session={null} />);
    expect(screen.getByText(/no active debate session/i)).toBeInTheDocument();
  });

  it("renders session status", () => {
    const session: Session = {
      id: "test-1",
      topic: "Test topic",
      status: "planning",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(<DebateTimeline session={session} />);
    expect(screen.getByText(/status: planning/i)).toBeInTheDocument();
  });

  it("renders initial context when available", () => {
    const session: Session = {
      id: "test-1",
      topic: "Test topic",
      status: "debating",
      context: {
        context: "Test context",
      },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(<DebateTimeline session={session} />);
    expect(screen.getByText(/initial context/i)).toBeInTheDocument();
    expect(screen.getByText("Test context")).toBeInTheDocument();
  });

  it("renders contexts when available", () => {
    const session: Session = {
      id: "test-1",
      topic: "Test topic",
      status: "debating",
      contexts: [
        {
          title: "Context 1",
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
