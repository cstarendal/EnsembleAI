import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SourcePanel from "../SourcePanel";
import type { Source } from "../../../types/session";

describe("SourcePanel", () => {
  it("renders empty state when no sources", () => {
    render(<SourcePanel sources={[]} />);
    expect(screen.getByText(/No sources found yet/i)).toBeInTheDocument();
  });

  it("renders sources with basic information", () => {
    const sources: Source[] = [
      {
        title: "Test Source 1",
        url: "http://example.com/1",
        snippet: "Test snippet 1",
      },
      {
        title: "Test Source 2",
        url: "http://example.com/2",
        snippet: "Test snippet 2",
      },
    ];

    render(<SourcePanel sources={sources} />);
    expect(screen.getByText("Test Source 1")).toBeInTheDocument();
    expect(screen.getByText("Test Source 2")).toBeInTheDocument();
    expect(screen.getByText("Test snippet 1")).toBeInTheDocument();
    expect(screen.getByText("Test snippet 2")).toBeInTheDocument();
  });

  it("displays hunter information when present", () => {
    const sources: Source[] = [
      {
        title: "Test Source",
        url: "http://example.com/1",
        snippet: "Test snippet",
        hunter: "A",
      },
    ];

    render(<SourcePanel sources={sources} />);
    expect(screen.getByText(/Hunter A/i)).toBeInTheDocument();
  });

  it("displays quality rating when present", () => {
    const sources: Source[] = [
      {
        title: "Test Source",
        url: "http://example.com/1",
        snippet: "Test snippet",
        qualityRating: 4,
      },
    ];

    render(<SourcePanel sources={sources} />);
    expect(screen.getByText(/4\/5/i)).toBeInTheDocument();
  });

  it("displays critique when present", () => {
    const sources: Source[] = [
      {
        title: "Test Source",
        url: "http://example.com/1",
        snippet: "Test snippet",
        critique: "This is a high-quality source.",
      },
    ];

    render(<SourcePanel sources={sources} />);
    expect(screen.getByText(/Critique:/i)).toBeInTheDocument();
    expect(screen.getByText("This is a high-quality source.")).toBeInTheDocument();
  });

  it("renders all source information together", () => {
    const sources: Source[] = [
      {
        title: "Complete Source",
        url: "http://example.com/complete",
        snippet: "Complete snippet",
        hunter: "B",
        qualityRating: 5,
        critique: "Excellent source with comprehensive information.",
      },
    ];

    render(<SourcePanel sources={sources} />);
    expect(screen.getByText("Complete Source")).toBeInTheDocument();
    expect(screen.getByText(/Hunter B/i)).toBeInTheDocument();
    expect(screen.getByText(/5\/5/i)).toBeInTheDocument();
    expect(
      screen.getByText("Excellent source with comprehensive information.")
    ).toBeInTheDocument();
  });
});
