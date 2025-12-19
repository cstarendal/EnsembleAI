import { render, screen } from "../../../test/testUtils";
import { expect, describe, it } from "vitest";
import AnswerDisplay from "../AnswerDisplay";

describe("AnswerDisplay", () => {
  it("renders placeholder when no answer", () => {
    render(<AnswerDisplay answer={null} />);
    expect(
      screen.getByText(/answer will appear here when research is complete/i),
    ).toBeInTheDocument();
  });

  it("renders answer when available", () => {
    const answer = "This is the research answer.";
    render(<AnswerDisplay answer={answer} />);

    expect(
      screen.getByRole("heading", { name: "Research Answer" }),
    ).toBeInTheDocument();
    expect(screen.getByText(answer)).toBeInTheDocument();
  });
});
