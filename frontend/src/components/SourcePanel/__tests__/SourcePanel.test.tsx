import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SourcePanel from "../SourcePanel";
import type { Context } from "../../../types/session";

describe("SourcePanel", () => {
  it("renders empty state when no sources", () => {
    render(<SourcePanel sources={[]} />);
    expect(screen.getByText(/No sources found yet/i)).toBeInTheDocument();
  });

  it("renders sources with basic information", () => {
    const sources: Context[] = [
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

  it("renders source with URL as link", () => {
    const sources: Context[] = [
      {
        title: "Test Source",
        url: "http://example.com/1",
        snippet: "Test snippet",
      },
    ];

    render(<SourcePanel sources={sources} />);
    const link = screen.getByRole("link", { name: "Test Source" });
    expect(link).toHaveAttribute("href", "http://example.com/1");
  });

  it("renders source without URL as text", () => {
    const sources: Context[] = [
      {
        title: "Test Source",
        snippet: "Test snippet",
      },
    ];

    render(<SourcePanel sources={sources} />);
    expect(screen.getByText("Test Source")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
