import { render, screen } from "../../../test/testUtils";
import { expect, describe, it } from "vitest";
import AnswerDisplay from "../AnswerDisplay";

describe("AnswerDisplay", () => {
  it("renders placeholder when no answer", () => {
    render(<AnswerDisplay answer={null} />);
    expect(
      screen.getByText(/answer will appear here when research is complete/i)
    ).toBeInTheDocument();
  });

  it("renders answer when available", () => {
    const answer = "This is the research answer.";
    render(<AnswerDisplay answer={answer} />);

    expect(screen.getByRole("heading", { name: "Research Answer" })).toBeInTheDocument();
    expect(screen.getByText(answer)).toBeInTheDocument();
  });

  it("displays citations when sources are provided", () => {
    const sources = [
      {
        title: "Source 1",
        url: "http://example.com/1",
        snippet: "Snippet 1",
      },
      {
        title: "Source 2",
        url: "http://example.com/2",
        snippet: "Snippet 2",
      },
    ];

    render(<AnswerDisplay answer="Test answer [1] and [2]" sources={sources} />);
    expect(screen.getByText(/Citations/i)).toBeInTheDocument();
    expect(screen.getByText("Source 1")).toBeInTheDocument();
    expect(screen.getByText("Source 2")).toBeInTheDocument();
  });
});
