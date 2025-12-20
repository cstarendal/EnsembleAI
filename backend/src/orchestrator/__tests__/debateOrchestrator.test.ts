import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "../../types/session.js";
import * as openRouter from "../../api/openRouter.js";
import { DEBATE_ROUND_TYPES } from "../../constants/ubiquitousLanguage.js";
import type { Persona } from "../../constants/personas.js";

// Partial mock the openRouter module
vi.mock("../../api/openRouter.js", async (importOriginal) => {
  const actual = await importOriginal<typeof openRouter>();
  return {
    ...actual,
    callAgent: vi.fn(),
    callProvider: vi.fn(),
    getAgentLabel: vi.fn(
      (displayName: string, providerId: string) => `${displayName} (${providerId})`
    ),
    selectProviderIdForPersona: vi.fn(() => "openai/gpt-4o-mini"),
    getAgentDisplayName: vi.fn((roleOrPersona) =>
      typeof roleOrPersona === "string" ? `Mock ${roleOrPersona}` : `Mock ${roleOrPersona.name}`
    ),
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

  const mockContexts: Context[] = [
    {
      title: "Context 1",
      snippet: "Information about topic 1",
    },
  ];

  const mockPersonas: Persona[] = [
    {
      id: "p1",
      name: "P1",
      role: "Role1",
      description: "d1",
      agenda: "a1",
      modelArchetype: "LOGIC",
    },
    {
      id: "p2",
      name: "P2",
      role: "Role2",
      description: "d2",
      agenda: "a2",
      modelArchetype: "CREATIVE",
    },
    { id: "p3", name: "P3", role: "Role3", description: "d3", agenda: "a3", modelArchetype: "RAW" },
  ];

  const mockWildcard: Persona = {
    id: "w1",
    name: "W1",
    role: "Wildcard",
    description: "wd",
    agenda: "wa",
    modelArchetype: "RAW",
  };

  const assignedCore = mockPersonas.map((p) => ({
    persona: p,
    providerId: "openai/gpt-4o-mini",
    agent: `Mock ${p.name}`,
    isWildcard: false,
  }));

  const assignedWildcard = {
    persona: mockWildcard,
    providerId: "openai/gpt-4o-mini",
    agent: `Mock ${mockWildcard.name}`,
    isWildcard: true,
  };

  describe("executePitchRound", () => {
    it("should generate pitch messages for all participants", async () => {
      const { executePitchRound } = await getDebateOrchestrator();

      vi.mocked(openRouter.callProvider).mockResolvedValue("My pitch content");
      const mockOnEvent = vi.fn();

      const messages = await executePitchRound("Topic", assignedCore, mockContexts, mockOnEvent);

      expect(messages).toHaveLength(3);
      expect(messages[0].round).toBe(DEBATE_ROUND_TYPES.PITCH);
      expect(messages[0].content).toBe("My pitch content");
      expect(openRouter.callProvider).toHaveBeenCalledTimes(3);
    });
  });

  describe("executeCrossFireRound", () => {
    it("should generate wildcard challenge and response", async () => {
      const { executeCrossFireRound } = await getDebateOrchestrator();

      // Mock pitch messages
      const pitchMessages = mockPersonas.map((p) => ({
        id: `msg-${p.id}`,
        role: p.role,
        personaId: p.id,
        agent: p.name,
        round: DEBATE_ROUND_TYPES.PITCH,
        roundNumber: 1,
        content: "Pitch content",
        timestamp: new Date(),
      }));

      vi.mocked(openRouter.callProvider)
        .mockResolvedValueOnce("Challenge!") // Wildcard
        .mockResolvedValueOnce("Response!"); // Target

      const mockOnEvent = vi.fn();

      const messages = await executeCrossFireRound({
        topic: "Topic",
        participants: assignedCore,
        wildcard: assignedWildcard,
        pitchMessages,
        onEvent: mockOnEvent,
      });

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe(mockWildcard.role);
      expect(messages[1].content).toBe("Response!");
    });
  });

  describe("executeStressTestRound", () => {
    it("should generate moderator scenario and participant responses", async () => {
      const { executeStressTestRound } = await getDebateOrchestrator();

      vi.mocked(openRouter.callAgent)
        .mockResolvedValueOnce("Scenario X") // Moderator
        .mockResolvedValue("Unused"); // Participants are handled via callProvider

      vi.mocked(openRouter.callProvider).mockResolvedValue("Response to X");

      const mockOnEvent = vi.fn();
      const allParticipants = [...assignedCore, assignedWildcard];

      const messages = await executeStressTestRound("Topic", allParticipants, mockOnEvent);

      expect(messages).toHaveLength(4); // 3 core + 1 wildcard
      expect(messages[0].round).toBe(DEBATE_ROUND_TYPES.STRESS_TEST);
      expect(messages[0].content).toContain("[Re: Scenario X]");
    });
  });

  describe("executeConsensusRound", () => {
    it("should generate consensus messages with scores", async () => {
      const { executeConsensusRound } = await getDebateOrchestrator();

      vi.mocked(openRouter.callProvider).mockResolvedValue("Statement: I agree. Score: 85");
      const mockOnEvent = vi.fn();

      const messages = await executeConsensusRound("Topic", assignedCore, [], mockOnEvent);

      expect(messages).toHaveLength(3);
      expect(messages[0].round).toBe(DEBATE_ROUND_TYPES.CONSENSUS);
      expect(messages[0].confidenceScore).toBe(85);
    });
  });
});
