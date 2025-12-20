import {
  callAgent,
  callProvider,
  getAgentDisplayName,
  getAgentLabel,
  selectProviderIdForPersona,
} from "../api/openRouter.js";
import type { DebateMessage, Context, SessionParticipant } from "../types/session.js";
import { DEBATE_ROUND_TYPES } from "../constants/ubiquitousLanguage.js";
import type { EventCallback } from "./basicOrchestrator.js";
import { PERSONA_POOL, type Persona } from "../constants/personas.js";

interface AssignedParticipant {
  persona: Persona;
  providerId: string;
  agent: string;
  isWildcard: boolean;
}

function hashToUint32(text: string): number {
  // FNV-1a 32-bit
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: string): () => number {
  // Mulberry32
  let t = hashToUint32(seed) >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const rng = createRng(seed);
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = newArray[i]!;
    newArray[i] = newArray[j]!;
    newArray[j] = tmp;
  }
  return newArray;
}

let debateMessageCounter = 0;

function createDebateMessageId(): string {
  debateMessageCounter += 1;
  return `debate-${Date.now()}-${debateMessageCounter}`;
}

function formatContextsContext(contexts: Context[]): string {
  return contexts
    .map((c, i) => `${i + 1}. ${c.title}${c.url ? ` (${c.url})` : ""}\n   ${c.snippet}`)
    .join("\n\n");
}

// Select 3 core participants + 1 wildcard
export function selectDebateParticipants(sessionId: string): {
  core: Persona[];
  wildcard: Persona;
} {
  const shuffled = shuffleWithSeed(PERSONA_POOL, `${sessionId}:personas`);
  // Ensure we have enough personas
  if (shuffled.length < 4) {
    throw new Error("Not enough personas in the pool to start a debate");
  }

  const wildcard = shuffled[3];
  if (!wildcard) {
    throw new Error("Wildcard persona missing from selection");
  }

  return {
    core: shuffled.slice(0, 3),
    wildcard,
  };
}

function assignParticipant(
  sessionId: string,
  persona: Persona,
  isWildcard: boolean
): AssignedParticipant {
  const providerId = selectProviderIdForPersona(persona, sessionId);
  return {
    persona,
    providerId,
    agent: getAgentLabel(persona.name, providerId),
    isWildcard,
  };
}

function toSessionParticipant(p: AssignedParticipant): SessionParticipant {
  return {
    personaId: p.persona.id,
    name: p.persona.name,
    role: p.persona.role,
    description: p.persona.description,
    providerId: p.providerId,
    agent: p.agent,
    isWildcard: p.isWildcard,
  };
}

function assignDebateParticipants(sessionId: string): {
  core: AssignedParticipant[];
  wildcard: AssignedParticipant;
  all: AssignedParticipant[];
  sessionParticipants: SessionParticipant[];
} {
  const { core, wildcard } = selectDebateParticipants(sessionId);
  const assignedCore = core.map((p) => assignParticipant(sessionId, p, false));
  const assignedWildcard = assignParticipant(sessionId, wildcard, true);
  const all = [...assignedCore, assignedWildcard];
  return {
    core: assignedCore,
    wildcard: assignedWildcard,
    all,
    sessionParticipants: all.map(toSessionParticipant),
  };
}

export async function executePitchRound(
  topic: string,
  participants: AssignedParticipant[],
  contexts: Context[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting Round 1: The Pitch`);
  const contextsText = contexts.length > 0 ? formatContextsContext(contexts) : "";

  const pitchPromises = participants.map(async (participant) => {
    const persona = participant.persona;
    try {
      const messages = [
        {
          role: "system" as const,
          content: `${persona.agenda}\n\nYou are participating in a debate about: "${topic}"\n\nMake a high-impact elevator pitch for your perspective. Hook the audience immediately.\n\nBe extremely concise (max 100 words).`,
        },
        {
          role: "user" as const,
          content: `Debate Topic: ${topic}${contextsText ? `\n\nContext:\n${contextsText}` : "\n\nProvide your opening pitch."}`,
        },
      ];

      const content = await callProvider(participant.providerId, messages);

      const debateMessage: DebateMessage = {
        id: createDebateMessageId(),
        role: persona.role,
        personaId: persona.id,
        agent: participant.agent,
        round: DEBATE_ROUND_TYPES.PITCH,
        roundNumber: 1,
        target: "all",
        content,
        position: extractPosition(content),
        keyPoints: extractKeyPoints(content),
        timestamp: new Date(),
      };

      onEvent({
        type: "debate_message",
        data: debateMessage,
      });

      onEvent({
        type: "message",
        data: {
          role: persona.role,
          content: `Pitch delivered`,
          agent: debateMessage.agent,
          timestamp: debateMessage.timestamp,
        },
      });

      return debateMessage;
    } catch (error) {
      console.error(`[Debate] Error generating pitch for ${persona.role}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      onEvent({
        type: "error",
        data: { error: `${persona.role} pitch failed: ${errorMessage}` },
      });
      // Return a fallback message
      return {
        id: createDebateMessageId(),
        role: persona.role,
        personaId: persona.id,
        agent: participant.agent,
        round: DEBATE_ROUND_TYPES.PITCH,
        roundNumber: 1,
        target: "all",
        content: `[Error: Could not generate pitch. ${errorMessage}]`,
        timestamp: new Date(),
      };
    }
  });

  const statements = await Promise.all(pitchPromises);
  console.log(`[Debate] Pitch round complete`);
  return statements;
}

interface CrossFireParams {
  topic: string;
  participants: AssignedParticipant[];
  wildcard: AssignedParticipant;
  pitchMessages: DebateMessage[];
  onEvent: EventCallback;
}

interface WildcardChallengeParams {
  wildcard: AssignedParticipant;
  targetParticipant: AssignedParticipant;
  targetPitch: DebateMessage;
  topic: string;
  onEvent: EventCallback;
}

async function generateWildcardChallenge(
  params: WildcardChallengeParams
): Promise<DebateMessage | null> {
  const { wildcard, targetParticipant, targetPitch, topic, onEvent } = params;
  const wildcardPersona = wildcard.persona;
  const targetPersona = targetParticipant.persona;
  try {
    const messages = [
      {
        role: "system" as const,
        content: `${wildcardPersona.agenda}\n\nYou are the WILDCARD entering the debate. Challenge the ${targetPersona.role}'s perspective with a completely new angle.\n\nBe concise and provocative (max 75 words).`,
      },
      {
        role: "user" as const,
        content: `Debate Topic: "${topic}"\n\n${targetPersona.role}'s Pitch: "${targetPitch.content}"\n\nChallenge them!`,
      },
    ];

    const content = await callProvider(wildcard.providerId, messages);

    const wildcardChallenge: DebateMessage = {
      id: createDebateMessageId(),
      role: wildcardPersona.role,
      personaId: wildcardPersona.id,
      agent: wildcard.agent,
      round: DEBATE_ROUND_TYPES.CROSS_FIRE,
      roundNumber: 2,
      target: targetPersona.role,
      content,
      timestamp: new Date(),
    };

    onEvent({ type: "debate_message", data: wildcardChallenge });
    onEvent({
      type: "message",
      data: {
        role: wildcardPersona.role,
        content: "Wildcard challenge!",
        agent: wildcardChallenge.agent,
        timestamp: new Date(),
      },
    });

    return wildcardChallenge;
  } catch (error) {
    console.error(`[Debate] Wildcard challenge failed:`, error);
    return null;
  }
}

async function generateCrossFireResponse(
  targetParticipant: AssignedParticipant,
  wildcard: AssignedParticipant,
  challenge: DebateMessage,
  onEvent: EventCallback
): Promise<DebateMessage | null> {
  const targetPersona = targetParticipant.persona;
  const wildcardPersona = wildcard.persona;
  try {
    const messages = [
      {
        role: "system" as const,
        content: `${targetPersona.agenda}\n\nA Wildcard (${wildcardPersona.role}) has challenged you. Respond immediately and defend your ground.\n\nFlash message (max 50 words).`,
      },
      {
        role: "user" as const,
        content: `Challenge from ${wildcardPersona.role}: "${challenge.content}"\n\nRespond!`,
      },
    ];

    const content = await callProvider(targetParticipant.providerId, messages);

    const responseMsg: DebateMessage = {
      id: createDebateMessageId(),
      role: targetPersona.role,
      personaId: targetPersona.id,
      agent: targetParticipant.agent,
      round: DEBATE_ROUND_TYPES.CROSS_FIRE,
      roundNumber: 2,
      target: wildcardPersona.role,
      content,
      timestamp: new Date(),
    };

    onEvent({ type: "debate_message", data: responseMsg });
    return responseMsg;
  } catch (error) {
    console.error(`[Debate] Cross-fire message failed:`, error);
    return null;
  }
}

function getCrossFireTarget(
  participants: AssignedParticipant[],
  pitchMessages: DebateMessage[]
): { targetParticipant: AssignedParticipant; targetPitch: DebateMessage } | null {
  if (participants.length === 0) {
    console.error("[Debate] No participants available for cross-fire");
    return null;
  }

  const targetIndex = Math.floor(Math.random() * participants.length);
  const targetParticipant = participants[targetIndex];
  if (!targetParticipant) {
    console.error("[Debate] Target persona missing for cross-fire");
    return null;
  }

  const targetPitch = pitchMessages.find((m) => m.personaId === targetParticipant.persona.id);
  if (!targetPitch) {
    console.error("Target pitch not found for cross-fire");
    return null;
  }

  return { targetParticipant, targetPitch };
}

export async function executeCrossFireRound(params: CrossFireParams): Promise<DebateMessage[]> {
  const { topic, participants, wildcard, pitchMessages, onEvent } = params;
  console.log(`[Debate] Starting Round 2: Cross-Fire (Wildcard enters)`);
  const crossFireMessages: DebateMessage[] = [];

  const target = getCrossFireTarget(participants, pitchMessages);
  if (!target) return [];
  const { targetParticipant, targetPitch } = target;

  const challenge = await generateWildcardChallenge({
    wildcard,
    targetParticipant,
    targetPitch,
    topic,
    onEvent,
  });

  if (challenge) {
    crossFireMessages.push(challenge);
    const counterMessage = await generateCrossFireResponse(
      targetParticipant,
      wildcard,
      challenge,
      onEvent
    );
    if (counterMessage) {
      crossFireMessages.push(counterMessage);
    }
  }

  return crossFireMessages;
}

export async function executeStressTestRound(
  topic: string,
  participants: AssignedParticipant[], // Includes core + wildcard
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting Round 3: Stress Test`);

  // 1. Moderator generates scenario
  let scenario = "";
  try {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are the Debate Moderator. Generate a specific, challenging hypothetical failure scenario related to the topic. Force the debaters to apply their abstract ideas to a concrete problem.",
      },
      {
        role: "user" as const,
        content: `Topic: ${topic}\n\nGenerate a 'Stress Test' scenario (max 2 sentences).`,
      },
    ];
    scenario = await callAgent("Moderator", messages);

    // Emit moderator message
    onEvent({
      type: "message",
      data: {
        role: "Moderator",
        content: `Stress Test Scenario: ${scenario}`,
        agent: getAgentDisplayName("Moderator"),
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to generate stress test scenario", error);
    scenario = "Imagine this approach fails catastrophically in 5 years. Why?";
  }

  // 2. Participants respond
  const responses = await Promise.all(
    participants.map(async (participant) => {
      const persona = participant.persona;
      try {
        const messages = [
          {
            role: "system" as const,
            content: `${persona.agenda}\n\nThe Moderator has posed a Stress Test scenario. Explain how your perspective handles this specific failure mode.\n\nBe realistic (max 100 words).`,
          },
          {
            role: "user" as const,
            content: `Scenario: "${scenario}"\n\nYour message?`,
          },
        ];

        const content = await callProvider(participant.providerId, messages);

        const msg: DebateMessage = {
          id: createDebateMessageId(),
          role: persona.role,
          personaId: persona.id,
          agent: participant.agent,
          round: DEBATE_ROUND_TYPES.STRESS_TEST,
          roundNumber: 3,
          target: "Moderator",
          content: `[Re: ${scenario}] ${content}`,
          timestamp: new Date(),
        };

        onEvent({ type: "debate_message", data: msg });
        return msg;
      } catch (error) {
        console.error(`Stress test message failed for ${persona.role}`, error);
        return null;
      }
    })
  );

  return responses.filter((r): r is DebateMessage => r !== null);
}

export async function executeSteelManRound(
  topic: string,
  participants: AssignedParticipant[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting Round 4: Steel Man`);

  // Each participant steel-mans a generic opposing view
  const responses = await Promise.all(
    participants.map(async (participant) => {
      const persona = participant.persona;
      try {
        const messages = [
          {
            role: "system" as const,
            content: `${persona.agenda}\n\nNow, articulate the STRONGEST version of the opposing argument. Demonstrate intellectual honesty.\n\nStart with 'The strongest argument against my view is...'\n\n(Max 100 words).`,
          },
          {
            role: "user" as const,
            content: `Topic: ${topic}\n\nSteel-man the opposition.`,
          },
        ];

        const content = await callProvider(participant.providerId, messages);

        const msg: DebateMessage = {
          id: createDebateMessageId(),
          role: persona.role,
          personaId: persona.id,
          agent: participant.agent,
          round: DEBATE_ROUND_TYPES.STEEL_MAN,
          roundNumber: 4,
          target: "all",
          content,
          timestamp: new Date(),
        };

        onEvent({ type: "debate_message", data: msg });
        return msg;
      } catch (error) {
        console.error(`Steel man failed for ${persona.role}`, error);
        return null;
      }
    })
  );

  return responses.filter((r): r is DebateMessage => r !== null);
}

export async function executeConsensusRound(
  topic: string,
  participants: AssignedParticipant[],
  allPreviousMessages: DebateMessage[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting Round 5: Consensus`);

  const debateRecap = allPreviousMessages
    .slice(-12)
    .map((m) => `- [R${m.roundNumber}] ${m.role}: ${m.content.substring(0, 200)}...`)
    .join("\n");

  const responses = await Promise.all(
    participants.map(async (participant) => {
      const persona = participant.persona;
      try {
        const messages = [
          {
            role: "system" as const,
            content: `${persona.agenda}\n\nFinal verdict. Give your closing statement and a Confidence Score (0-100%) in the proposed path forward.\n\nFormat:\nStatement: [Your text]\nScore: [0-100]`,
          },
          {
            role: "user" as const,
            content: `Topic: ${topic}\n\nRecent debate messages:\n${debateRecap || "(none)"}\n\nProvide your final verdict and confidence score.`,
          },
        ];

        const rawContent = await callProvider(participant.providerId, messages);
        const scoreMatch = rawContent.match(/Score:\s*(\d+)/i);
        const scoreText = scoreMatch?.[1];
        const score = scoreText ? parseInt(scoreText, 10) : 50;
        const content = rawContent
          .replace(/Score:\s*\d+/i, "")
          .replace("Statement:", "")
          .trim();

        const msg: DebateMessage = {
          id: createDebateMessageId(),
          role: persona.role,
          personaId: persona.id,
          agent: participant.agent,
          round: DEBATE_ROUND_TYPES.CONSENSUS,
          roundNumber: 5,
          target: "all",
          content,
          confidenceScore: Math.min(100, Math.max(0, score)),
          timestamp: new Date(),
        };

        onEvent({ type: "debate_message", data: msg });
        onEvent({
          type: "message",
          data: {
            role: persona.role,
            content: `Final verdict given (Confidence: ${msg.confidenceScore}%)`,
            agent: msg.agent,
            timestamp: new Date(),
          },
        });

        return msg;
      } catch (error) {
        console.error(`Consensus failed for ${persona.role}`, error);
        return null;
      }
    })
  );

  return responses.filter((r): r is DebateMessage => r !== null);
}

export async function runDebate(
  sessionId: string,
  topic: string,
  contexts: Context[],
  onEvent: EventCallback
): Promise<{ messages: DebateMessage[]; participants: SessionParticipant[] }> {
  console.log(`[Debate] Starting Arena for: ${topic.substring(0, 50)}...`);

  // 1. Selection
  const { core, wildcard, all, sessionParticipants } = assignDebateParticipants(sessionId);

  onEvent({ type: "participants", data: sessionParticipants });

  // Notify about selection
  onEvent({
    type: "message",
    data: {
      role: "System",
      content: `Selected participants: ${core.map((p) => p.persona.role).join(", ")}`,
      timestamp: new Date(),
    },
  });

  const allDebateMessages: DebateMessage[] = [];

  // Round 1: The Pitch
  const pitchMessages = await executePitchRound(topic, core, contexts, onEvent);
  allDebateMessages.push(...pitchMessages);

  // Round 2: Cross-Fire (Wildcard enters)
  const crossFireMessages = await executeCrossFireRound({
    topic,
    participants: core,
    wildcard,
    pitchMessages,
    onEvent,
  });
  allDebateMessages.push(...crossFireMessages);

  // Round 3: Stress Test (All participants including wildcard)
  const stressMessages = await executeStressTestRound(topic, all, onEvent);
  allDebateMessages.push(...stressMessages);

  // Round 4: Steel Man
  const steelManMessages = await executeSteelManRound(topic, all, onEvent);
  allDebateMessages.push(...steelManMessages);

  // Round 5: Consensus
  const consensusMessages = await executeConsensusRound(topic, all, allDebateMessages, onEvent);
  allDebateMessages.push(...consensusMessages);

  console.log(`[Debate] Arena complete with ${allDebateMessages.length} messages`);

  return {
    messages: allDebateMessages,
    participants: sessionParticipants,
  };
}

// Helpers
const POSITION_KEYWORDS: Array<{ keywords: string[]; position: DebateMessage["position"] }> = [
  { keywords: ["strongly support", "strongly for"], position: "for" },
  { keywords: ["strongly against", "oppose"], position: "against" },
  { keywords: ["mixed", "both sides"], position: "mixed" },
  { keywords: ["neutral", "uncertain"], position: "neutral" },
  { keywords: ["support", "agree"], position: "for" },
  { keywords: ["disagree", "against"], position: "against" },
];

function extractPosition(content: string): DebateMessage["position"] {
  const lower = content.toLowerCase();
  for (const { keywords, position } of POSITION_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return position;
    }
  }
  return "neutral";
}

function extractKeyPoints(content: string): string[] {
  const lines = content.split("\n");
  const points: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(\d+\.|\*|-)\s+/.test(trimmed)) {
      const point = trimmed.replace(/^(\d+\.|\*|-)\s+/, "").trim();
      if (point.length > 10 && point.length < 200) {
        points.push(point);
      }
    }
  }
  return points.slice(0, 5);
}
