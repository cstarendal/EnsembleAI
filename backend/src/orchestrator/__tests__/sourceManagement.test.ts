import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Source, ResearchPlan } from "../../types/session.js";
import * as openRouter from "../../api/openRouter.js";

// Mock the openRouter module
vi.mock("../../api/openRouter.js", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/openRouter.js")>("../../api/openRouter.js");
  return {
    ...actual,
    callAgent: vi.fn(),
  };
});

// Need to import after mocking
async function getFindSources() {
  const module = await import("../basicOrchestrator.js");
  return module.findSources;
}

async function getCritiqueSources() {
  const module = await import("../basicOrchestrator.js");
  return module.critiqueSources;
}

describe("Source Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findSources with dual hunters", () => {
    it("should combine results from both hunters", async () => {
      const findSources = await getFindSources();
      const plan: ResearchPlan = {
        plan: "Test plan",
        searchQueries: ["query1", "query2"],
      };

      vi.mocked(openRouter.callAgent).mockResolvedValueOnce(
        JSON.stringify([
          { title: "Source A1", url: "http://example.com/a1", snippet: "Snippet A1" },
          { title: "Source A2", url: "http://example.com/a2", snippet: "Snippet A2" },
        ])
      );
      vi.mocked(openRouter.callAgent).mockResolvedValueOnce(
        JSON.stringify([
          { title: "Source B1", url: "http://example.com/b1", snippet: "Snippet B1" },
          { title: "Source B2", url: "http://example.com/b2", snippet: "Snippet B2" },
        ])
      );

      const mockOnEvent = vi.fn();
      const sources = await findSources(plan, mockOnEvent);

      expect(sources).toHaveLength(4);
      expect(sources[0]?.hunter).toBe("A");
      expect(sources[1]?.hunter).toBe("A");
      expect(sources[2]?.hunter).toBe("B");
      expect(sources[3]?.hunter).toBe("B");
      expect(openRouter.callAgent).toHaveBeenCalledTimes(2);
    });

    it("should deduplicate sources by URL", async () => {
      const findSources = await getFindSources();
      const plan: ResearchPlan = {
        plan: "Test plan",
        searchQueries: ["query1"],
      };

      vi.mocked(openRouter.callAgent).mockResolvedValueOnce(
        JSON.stringify([
          { title: "Source 1", url: "http://example.com/same", snippet: "Snippet 1" },
        ])
      );
      vi.mocked(openRouter.callAgent).mockResolvedValueOnce(
        JSON.stringify([
          { title: "Source 2", url: "http://example.com/same", snippet: "Snippet 2" },
        ])
      );

      const mockOnEvent = vi.fn();
      const sources = await findSources(plan, mockOnEvent);

      expect(sources).toHaveLength(1);
      expect(sources[0]?.url).toBe("http://example.com/same");
    });
  });

  describe("critiqueSources", () => {
    it("should add quality rating and critique to sources", async () => {
      const critiqueSources = await getCritiqueSources();
      const sources: Source[] = [
        {
          title: "Test Source",
          url: "http://example.com/test",
          snippet: "Test snippet",
          hunter: "A",
        },
      ];

      vi.mocked(openRouter.callAgent).mockResolvedValueOnce(
        "Rating: 4\nCritique: This is a high-quality source with relevant information."
      );

      const mockOnEvent = vi.fn();
      const critiqued = await critiqueSources(sources, "Test question", mockOnEvent);

      expect(critiqued).toHaveLength(1);
      expect(critiqued[0]?.qualityRating).toBe(4);
      expect(critiqued[0]?.critique).toContain("high-quality");
      expect(openRouter.callAgent).toHaveBeenCalledTimes(1);
    });

    it("should handle missing rating gracefully", async () => {
      const critiqueSources = await getCritiqueSources();
      const sources: Source[] = [
        {
          title: "Test Source",
          url: "http://example.com/test",
          snippet: "Test snippet",
        },
      ];

      vi.mocked(openRouter.callAgent).mockResolvedValueOnce("Critique: This source is relevant.");

      const mockOnEvent = vi.fn();
      const critiqued = await critiqueSources(sources, "Test question", mockOnEvent);

      expect(critiqued[0]?.qualityRating).toBe(3); // Default
      expect(critiqued[0]?.critique).toBeDefined();
    });

    it("should handle critique errors gracefully", async () => {
      const critiqueSources = await getCritiqueSources();
      const sources: Source[] = [
        {
          title: "Test Source",
          url: "http://example.com/test",
          snippet: "Test snippet",
        },
      ];

      vi.mocked(openRouter.callAgent).mockRejectedValueOnce(new Error("API error"));

      const mockOnEvent = vi.fn();
      const critiqued = await critiqueSources(sources, "Test question", mockOnEvent);

      expect(critiqued).toHaveLength(1);
      expect(critiqued[0]?.qualityRating).toBe(3);
      expect(critiqued[0]?.critique).toBe("No critique available");
    });
  });
});
