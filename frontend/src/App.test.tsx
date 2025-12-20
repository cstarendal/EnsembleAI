import { describe, it, expect } from "vitest";
import { render, screen } from "./test/testUtils";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    const heading = screen.getByText(/Ensemble AI Debate System/i);
    expect(heading).toBeDefined();
  });
});
