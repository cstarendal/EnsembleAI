import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Source } from "../../types/session.js";
import * as openRouter from "../../api/openRouter.js";
import { AGENT_ROLES, DEBATE_ROUND_TYPES } from "../../constants/ubiquitousLanguage.js";

// Partial mock the openRouter module
vi.mock("../../api/openRouter.js", async (importOriginal) => {
  const actual = await importOriginal<typeof openRouter>();
  return {
    ...actual,
    callAgent: vi.fn(),
    getAgentDisplayName: vi.fn((role) => `Mock ${role} Agent`),
  };
});

// Import after mocking
async function getDebateOrchestrator() {
  return await import("../debateOrchestrator.js");
}

describe("Debate Orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSources: Source[] = [
    {
      title: "Source 1",
      snippet: "Information about topic 1",
      qualityRating: 4,
      critique: "Good source",
    },
    {
      title: "Source 2",
      snippet: "Information about topic 2",
      qualityRating: 3,
      critique: "Adequate source",
    },
  ];

  describe("executeOpeningStatements", () => {
    it("should generate opening statements from all three debate participants", async () => {
      const { executeOpeningStatements } = await getDebateOrchestrator();

      // Mock agent calls for each participant
      vi.mocked(openRouter.callAgent)
        .mockResolvedValueOnce(
          "I see methodological issues with the sources. My position is neutral."
        )
        .mockResolvedValueOnce("I identify 4 main themes. My position is for the proposition.")
        .mockResolvedValueOnce("I am skeptical of 2 conclusions. My position is against.");

      const mockOnEvent = vi.fn();
      const statements = await executeOpeningStatements(
        "What is the effect of UBI?",
        mockSources,
        mockOnEvent
      );

      expect(statements).toHaveLength(3);
      expect(statements[0]?.round).toBe(DEBATE_ROUND_TYPES.OPENING);
      expect(statements[0]?.roundNumber).toBe(3);

      // Check all participants are represented
      const roles = statements.map((s) => s.role);
      expect(roles).toContain(AGENT_ROLES.SOURCE_CRITIC);
      expect(roles).toContain(AGENT_ROLES.SYNTHESIZER);
      expect(roles).toContain(AGENT_ROLES.SKEPTIC);

      // Should have called callAgent 3 times (parallel)
      expect(openRouter.callAgent).toHaveBeenCalledTimes(3);

      // Should emit 3 message events
      expect(mockOnEvent).toHaveBeenCalledTimes(3);
    });
  });

  describe("executeCrossExamination", () => {
    it("should generate cross-examination messages between participants", async () => {
      const { executeCrossExamination } = await getDebateOrchestrator();

      const openingStatements = [
        {
          id: "1",
          role: AGENT_ROLES.SOURCE_CRITIC,
          agent: "Mock Critic",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Critic opening",
          timestamp: new Date(),
        },
        {
          id: "2",
          role: AGENT_ROLES.SYNTHESIZER,
          agent: "Mock Synthesizer",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Synthesizer opening",
          timestamp: new Date(),
        },
        {
          id: "3",
          role: AGENT_ROLES.SKEPTIC,
          agent: "Mock Skeptic",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Skeptic opening",
          timestamp: new Date(),
        },
      ];

      vi.mocked(openRouter.callAgent)
        .mockResolvedValueOnce("Critic questions Synthesizer")
        .mockResolvedValueOnce("Synthesizer questions Skeptic")
        .mockResolvedValueOnce("Skeptic questions Critic");

      const mockOnEvent = vi.fn();
      const crossExam = await executeCrossExamination(
        "What is the effect of UBI?",
        openingStatements,
        mockOnEvent
      );

      expect(crossExam).toHaveLength(3);
      expect(crossExam[0]?.round).toBe(DEBATE_ROUND_TYPES.CROSS_EXAM);
      expect(crossExam[0]?.roundNumber).toBe(4);

      // Check targets are set correctly
      expect(crossExam[0]?.target).toBe(AGENT_ROLES.SYNTHESIZER);
      expect(crossExam[1]?.target).toBe(AGENT_ROLES.SKEPTIC);
      expect(crossExam[2]?.target).toBe(AGENT_ROLES.SOURCE_CRITIC);
    });
  });

  describe("executeRebuttal", () => {
    it("should generate rebuttal messages from all participants", async () => {
      const { executeRebuttal } = await getDebateOrchestrator();

      const openingStatements = [
        {
          id: "1",
          role: AGENT_ROLES.SOURCE_CRITIC,
          agent: "Mock Critic",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Critic opening",
          timestamp: new Date(),
        },
        {
          id: "2",
          role: AGENT_ROLES.SYNTHESIZER,
          agent: "Mock Synthesizer",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Synthesizer opening",
          timestamp: new Date(),
        },
        {
          id: "3",
          role: AGENT_ROLES.SKEPTIC,
          agent: "Mock Skeptic",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Skeptic opening",
          timestamp: new Date(),
        },
      ];

      const crossExamMessages = [
        {
          id: "4",
          role: AGENT_ROLES.SOURCE_CRITIC,
          agent: "Mock Critic",
          round: DEBATE_ROUND_TYPES.CROSS_EXAM as const,
          roundNumber: 4,
          target: AGENT_ROLES.SYNTHESIZER,
          content: "Question to Synthesizer",
          timestamp: new Date(),
        },
      ];

      vi.mocked(openRouter.callAgent)
        .mockResolvedValueOnce("Critic rebuttal. I now agree with some points.")
        .mockResolvedValueOnce("Synthesizer rebuttal")
        .mockResolvedValueOnce("Skeptic rebuttal");

      const mockOnEvent = vi.fn();
      const rebuttals = await executeRebuttal(
        "What is the effect of UBI?",
        openingStatements,
        crossExamMessages,
        mockOnEvent
      );

      expect(rebuttals).toHaveLength(3);
      expect(rebuttals[0]?.round).toBe(DEBATE_ROUND_TYPES.REBUTTAL);
      expect(rebuttals[0]?.roundNumber).toBe(5);
    });
  });

  describe("executeFinalPositions", () => {
    it("should generate final position messages from all participants", async () => {
      const { executeFinalPositions } = await getDebateOrchestrator();

      const openingStatements = [
        {
          id: "1",
          role: AGENT_ROLES.SOURCE_CRITIC,
          agent: "Mock Critic",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Critic opening",
          timestamp: new Date(),
        },
        {
          id: "2",
          role: AGENT_ROLES.SYNTHESIZER,
          agent: "Mock Synthesizer",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Synthesizer opening",
          timestamp: new Date(),
        },
        {
          id: "3",
          role: AGENT_ROLES.SKEPTIC,
          agent: "Mock Skeptic",
          round: DEBATE_ROUND_TYPES.OPENING as const,
          roundNumber: 3,
          target: "all",
          content: "Skeptic opening",
          timestamp: new Date(),
        },
      ];

      const rebuttalMessages = openingStatements.map((s) => ({
        ...s,
        id: `rebuttal-${s.id}`,
        round: DEBATE_ROUND_TYPES.REBUTTAL as const,
        roundNumber: 5,
      }));

      vi.mocked(openRouter.callAgent)
        .mockResolvedValueOnce("Final position: neutral. My conclusion is...")
        .mockResolvedValueOnce("Final position: I support the proposition.")
        .mockResolvedValueOnce("Final position: I remain against, but acknowledge...");

      const mockOnEvent = vi.fn();
      const finals = await executeFinalPositions(
        "What is the effect of UBI?",
        openingStatements,
        rebuttalMessages,
        mockOnEvent
      );

      expect(finals).toHaveLength(3);
      expect(finals[0]?.round).toBe(DEBATE_ROUND_TYPES.FINAL);
      expect(finals[0]?.roundNumber).toBe(6);
    });
  });

  describe("runDebate", () => {
    it("should run full debate flow and return all messages", async () => {
      const { runDebate } = await getDebateOrchestrator();

      // Mock all 12 agent calls (3 opening + 3 cross-exam + 3 rebuttal + 3 final)
      const mockCall = vi.mocked(openRouter.callAgent);
      for (let i = 0; i < 12; i++) {
        mockCall.mockResolvedValueOnce(`Debate message ${i + 1}`);
      }

      const mockOnEvent = vi.fn();
      const allMessages = await runDebate("What is the effect of UBI?", mockSources, mockOnEvent);

      // Should have 12 total messages (3 per round × 4 rounds)
      expect(allMessages).toHaveLength(12);

      // Check round distribution
      const byRound = {
        opening: allMessages.filter((m) => m.round === DEBATE_ROUND_TYPES.OPENING),
        cross_exam: allMessages.filter((m) => m.round === DEBATE_ROUND_TYPES.CROSS_EXAM),
        rebuttal: allMessages.filter((m) => m.round === DEBATE_ROUND_TYPES.REBUTTAL),
        final: allMessages.filter((m) => m.round === DEBATE_ROUND_TYPES.FINAL),
      };

      expect(byRound.opening).toHaveLength(3);
      expect(byRound.cross_exam).toHaveLength(3);
      expect(byRound.rebuttal).toHaveLength(3);
      expect(byRound.final).toHaveLength(3);

      // Should emit message events for each debate message
      expect(mockOnEvent.mock.calls.filter((c) => c[0]?.type === "message").length).toBe(12);
    });
  });
});
