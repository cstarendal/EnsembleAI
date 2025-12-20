import { callAgent, getAgentDisplayName } from "../api/openRouter.js";
import type { DebateMessage, Source } from "../types/session.js";
import { AGENT_ROLES, DEBATE_ROUND_TYPES } from "../constants/ubiquitousLanguage.js";
import type { AgentRole } from "../constants/ubiquitousLanguage.js";
import type { EventCallback } from "./basicOrchestrator.js";

// Debate participants
const DEBATE_PARTICIPANTS = [
  AGENT_ROLES.SOURCE_CRITIC,
  AGENT_ROLES.SYNTHESIZER,
  AGENT_ROLES.SKEPTIC,
] as const;

type DebateParticipant = (typeof DEBATE_PARTICIPANTS)[number];

let debateMessageCounter = 0;

function createDebateMessageId(): string {
  debateMessageCounter += 1;
  return `debate-${Date.now()}-${debateMessageCounter}`;
}

function getAgenda(role: DebateParticipant): string {
  const agendas: Record<DebateParticipant, string> = {
    [AGENT_ROLES.SOURCE_CRITIC]:
      "You are 'The Rigorous Analyst'. Focus on methodology, source quality, and potential bias. Be analytical and demanding.",
    [AGENT_ROLES.SYNTHESIZER]:
      "You are 'The Balanced Synthesizer'. Find consensus and balance perspectives. Be balanced and inclusive.",
    [AGENT_ROLES.SKEPTIC]:
      "You are 'The Challenger'. Question assumptions and find gaps in reasoning. Be challenging and critical.",
  };
  return agendas[role];
}

function formatSourcesContext(sources: Source[]): string {
  return sources
    .map(
      (s, i) =>
        `${i + 1}. ${s.title} (Quality: ${s.qualityRating || "N/A"}/5)\n   ${s.snippet}\n   ${s.critique ? `Critique: ${s.critique}` : ""}`
    )
    .join("\n\n");
}

export async function executeOpeningStatements(
  question: string,
  sources: Source[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting opening statements`);
  const sourcesContext = formatSourcesContext(sources);

  const openingPromises = DEBATE_PARTICIPANTS.map(async (role) => {
    const messages = [
      {
        role: "system" as const,
        content: `${getAgenda(role)}\n\nYou are participating in a research debate about: "${question}"\n\nGive your opening statement based on the sources provided. Include:\n1. Your initial position (for/against/neutral/mixed)\n2. 2-3 key points from your perspective\n3. Any concerns or questions you want to raise\n\nBe concise (150-200 words).`,
      },
      {
        role: "user" as const,
        content: `Sources:\n${sourcesContext}\n\nProvide your opening statement.`,
      },
    ];

    const content = await callAgent(role as AgentRole, messages);

    const debateMessage: DebateMessage = {
      id: createDebateMessageId(),
      role,
      agent: getAgentDisplayName(role as AgentRole),
      round: DEBATE_ROUND_TYPES.OPENING,
      roundNumber: 3,
      target: "all",
      content,
      position: extractPosition(content),
      keyPoints: extractKeyPoints(content),
      timestamp: new Date(),
    };

    onEvent({
      type: "message",
      data: {
        role,
        content: `Opening statement delivered`,
        agent: debateMessage.agent,
        timestamp: debateMessage.timestamp,
      },
    });

    return debateMessage;
  });

  const statements = await Promise.all(openingPromises);
  console.log(`[Debate] Opening statements complete`);
  return statements;
}

export async function executeCrossExamination(
  question: string,
  openingStatements: DebateMessage[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting cross-examination`);
  const crossExamMessages: DebateMessage[] = [];

  // Each participant questions the next one in sequence
  const pairs: Array<[DebateParticipant, DebateParticipant]> = [
    [AGENT_ROLES.SOURCE_CRITIC, AGENT_ROLES.SYNTHESIZER],
    [AGENT_ROLES.SYNTHESIZER, AGENT_ROLES.SKEPTIC],
    [AGENT_ROLES.SKEPTIC, AGENT_ROLES.SOURCE_CRITIC],
  ];

  for (const [questioner, responder] of pairs) {
    const questStatement = openingStatements.find((s) => s.role === questioner);
    const respStatement = openingStatements.find((s) => s.role === responder);

    if (!questStatement || !respStatement) continue;

    const messages = [
      {
        role: "system" as const,
        content: `${getAgenda(questioner)}\n\nYou are in the cross-examination round. Question the ${responder}'s opening statement. Be direct and probe weaknesses in their argument.\n\nBe concise (100-150 words).`,
      },
      {
        role: "user" as const,
        content: `Research question: "${question}"\n\nYour opening statement:\n${questStatement.content}\n\n${responder}'s opening statement:\n${respStatement.content}\n\nQuestion their position and reasoning.`,
      },
    ];

    const content = await callAgent(questioner as AgentRole, messages);

    const debateMessage: DebateMessage = {
      id: createDebateMessageId(),
      role: questioner,
      agent: getAgentDisplayName(questioner as AgentRole),
      round: DEBATE_ROUND_TYPES.CROSS_EXAM,
      roundNumber: 4,
      target: responder,
      content,
      timestamp: new Date(),
    };

    crossExamMessages.push(debateMessage);

    onEvent({
      type: "message",
      data: {
        role: questioner,
        content: `Cross-examined ${responder}`,
        agent: debateMessage.agent,
        timestamp: debateMessage.timestamp,
      },
    });
  }

  console.log(`[Debate] Cross-examination complete`);
  return crossExamMessages;
}

export async function executeRebuttal(
  question: string,
  openingStatements: DebateMessage[],
  crossExamMessages: DebateMessage[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting rebuttal round`);
  const rebuttalMessages: DebateMessage[] = [];

  for (const role of DEBATE_PARTICIPANTS) {
    const myOpening = openingStatements.find((s) => s.role === role);
    const questionsToMe = crossExamMessages.filter((m) => m.target === role);
    const otherOpenings = openingStatements.filter((s) => s.role !== role);

    if (!myOpening) continue;

    const challengesText = questionsToMe.map((q) => `${q.role}: ${q.content}`).join("\n\n");

    const othersText = otherOpenings.map((o) => `${o.role}: ${o.content}`).join("\n\n");

    const messages = [
      {
        role: "system" as const,
        content: `${getAgenda(role as DebateParticipant)}\n\nYou are in the rebuttal round. Defend your position against challenges, acknowledge valid points from others, and refine your position if needed.\n\nInclude:\n1. What you still maintain\n2. What you now agree with (if anything)\n3. Your refined position\n\nBe concise (150-200 words).`,
      },
      {
        role: "user" as const,
        content: `Research question: "${question}"\n\nYour opening statement:\n${myOpening.content}\n\nChallenges to your position:\n${challengesText || "None"}\n\nOther perspectives:\n${othersText}\n\nProvide your rebuttal and refined position.`,
      },
    ];

    const content = await callAgent(role as AgentRole, messages);

    const debateMessage: DebateMessage = {
      id: createDebateMessageId(),
      role,
      agent: getAgentDisplayName(role as AgentRole),
      round: DEBATE_ROUND_TYPES.REBUTTAL,
      roundNumber: 5,
      target: "all",
      content,
      revisions: extractRevisions(content),
      timestamp: new Date(),
    };

    rebuttalMessages.push(debateMessage);

    onEvent({
      type: "message",
      data: {
        role,
        content: `Rebuttal delivered`,
        agent: debateMessage.agent,
        timestamp: debateMessage.timestamp,
      },
    });
  }

  console.log(`[Debate] Rebuttal round complete`);
  return rebuttalMessages;
}

export async function executeFinalPositions(
  question: string,
  openingStatements: DebateMessage[],
  rebuttalMessages: DebateMessage[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting final positions`);

  const finalPromises = DEBATE_PARTICIPANTS.map(async (role) => {
    const myOpening = openingStatements.find((s) => s.role === role);
    const myRebuttal = rebuttalMessages.find((s) => s.role === role);
    const otherRebuttals = rebuttalMessages.filter((s) => s.role !== role);

    const othersText = otherRebuttals.map((r) => `${r.role}: ${r.content}`).join("\n\n");

    const messages = [
      {
        role: "system" as const,
        content: `${getAgenda(role as DebateParticipant)}\n\nThis is the final round. State your final position clearly.\n\nInclude:\n1. Your final position (for/against/neutral/mixed)\n2. Key conclusions (2-3 points)\n3. What changed from your opening (if anything)\n4. Remaining uncertainties\n\nBe concise (150-200 words).`,
      },
      {
        role: "user" as const,
        content: `Research question: "${question}"\n\nYour opening:\n${myOpening?.content || "N/A"}\n\nYour rebuttal:\n${myRebuttal?.content || "N/A"}\n\nOther final rebuttals:\n${othersText}\n\nState your final position.`,
      },
    ];

    const content = await callAgent(role as AgentRole, messages);

    const debateMessage: DebateMessage = {
      id: createDebateMessageId(),
      role,
      agent: getAgentDisplayName(role as AgentRole),
      round: DEBATE_ROUND_TYPES.FINAL,
      roundNumber: 6,
      target: "all",
      content,
      position: extractPosition(content),
      keyPoints: extractKeyPoints(content),
      revisions: extractRevisions(content),
      timestamp: new Date(),
    };

    onEvent({
      type: "message",
      data: {
        role,
        content: `Final position stated`,
        agent: debateMessage.agent,
        timestamp: debateMessage.timestamp,
      },
    });

    return debateMessage;
  });

  const finalPositions = await Promise.all(finalPromises);
  console.log(`[Debate] Final positions complete`);
  return finalPositions;
}

export async function runDebate(
  question: string,
  sources: Source[],
  onEvent: EventCallback
): Promise<DebateMessage[]> {
  console.log(`[Debate] Starting full debate for: ${question.substring(0, 50)}...`);

  const allDebateMessages: DebateMessage[] = [];

  // Round 3: Opening Statements (parallel)
  const openingStatements = await executeOpeningStatements(question, sources, onEvent);
  allDebateMessages.push(...openingStatements);

  // Round 4: Cross-Examination (sequential)
  const crossExamMessages = await executeCrossExamination(question, openingStatements, onEvent);
  allDebateMessages.push(...crossExamMessages);

  // Round 5: Rebuttal (sequential)
  const rebuttalMessages = await executeRebuttal(
    question,
    openingStatements,
    crossExamMessages,
    onEvent
  );
  allDebateMessages.push(...rebuttalMessages);

  // Round 6: Final Positions (parallel)
  const finalPositions = await executeFinalPositions(
    question,
    openingStatements,
    rebuttalMessages,
    onEvent
  );
  allDebateMessages.push(...finalPositions);

  console.log(`[Debate] Full debate complete with ${allDebateMessages.length} messages`);
  return allDebateMessages;
}

// Position keywords mapped to their positions
const POSITION_KEYWORDS: Array<{ keywords: string[]; position: DebateMessage["position"] }> = [
  { keywords: ["strongly support", "strongly for"], position: "for" },
  { keywords: ["strongly against", "oppose"], position: "against" },
  { keywords: ["mixed", "both sides"], position: "mixed" },
  { keywords: ["neutral", "uncertain"], position: "neutral" },
  { keywords: ["support", "agree"], position: "for" },
  { keywords: ["disagree", "against"], position: "against" },
];

// Helper functions to extract structured data from agent outputs
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
    // Match numbered points or bullet points
    if (/^(\d+\.|\*|-)\s+/.test(trimmed)) {
      const point = trimmed.replace(/^(\d+\.|\*|-)\s+/, "").trim();
      if (point.length > 10 && point.length < 200) {
        points.push(point);
      }
    }
  }

  return points.slice(0, 5);
}

function extractRevisions(content: string): string | undefined {
  const lower = content.toLowerCase();
  const markers = [
    "i now agree",
    "i've changed",
    "i have changed",
    "i revised",
    "i've revised",
    "what changed",
    "my position has shifted",
    "i concede",
  ];

  for (const marker of markers) {
    const idx = lower.indexOf(marker);
    if (idx !== -1) {
      // Extract the sentence containing the revision
      const start = Math.max(0, content.lastIndexOf(".", idx) + 1);
      const end = content.indexOf(".", idx + marker.length);
      if (end > start) {
        return content.substring(start, end + 1).trim();
      }
    }
  }

  return undefined;
}
