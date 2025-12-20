import { render, screen } from "../../../test/testUtils";
import { expect, describe, it } from "vitest";
import ConclusionDisplay from "../ConclusionDisplay";

describe("ConclusionDisplay", () => {
  it("renders placeholder when no conclusion", () => {
    render(<ConclusionDisplay conclusion={null} />);
    expect(
      screen.getByText(/conclusion will appear here when debate is complete/i)
    ).toBeInTheDocument();
  });

  it("renders conclusion when available", () => {
    const conclusion = "This is the debate conclusion.";
    render(<ConclusionDisplay conclusion={conclusion} />);

    expect(screen.getByRole("heading", { name: "Debate Conclusion" })).toBeInTheDocument();
    expect(screen.getByText(conclusion)).toBeInTheDocument();
  });

  it("displays context when contexts are provided", () => {
    const contexts = [
      {
        title: "Context 1",
        url: "http://example.com/1",
        snippet: "Snippet 1",
      },
      {
        title: "Context 2",
        url: "http://example.com/2",
        snippet: "Snippet 2",
      },
    ];

    render(<ConclusionDisplay conclusion="Test conclusion" contexts={contexts} />);
    expect(screen.getByRole("heading", { name: /Context/i })).toBeInTheDocument();
    expect(screen.getByText("Context 1")).toBeInTheDocument();
    expect(screen.getByText("Context 2")).toBeInTheDocument();
  });
});
