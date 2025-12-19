/**
 * Ubiquitous Language Registry
 * 
 * All domain terms must be defined here and used consistently
 * across code, UI, documentation, and API.
 * 
 * See docs/UBIQUITOUS_LANGUAGE.md for usage guidelines.
 */

// Core Domain Concepts
export const DOMAIN_TERMS = {
  RESEARCH: "Research",
  QUESTION: "Question",
  SESSION: "Session",
  AGENT: "Agent",
  ROLE: "Role",
  DEBATE: "Debate",
  ROUND: "Round",
  SOURCE: "Source",
  SYNTHESIS: "Synthesis",
  MODERATION: "Moderation",
  TIMELINE: "Timeline",
  MESSAGE: "Message",
  OPENING_STATEMENT: "Opening Statement",
  CROSS_EXAMINATION: "Cross-Examination",
  REBUTTAL: "Rebuttal",
  FINAL_POSITION: "Final Position",
  CONSENSUS: "Consensus",
  DISAGREEMENT: "Disagreement",
  UNCERTAINTY: "Uncertainty",
  CITATION: "Citation",
  QUALITY_RATING: "Quality Rating",
  RESEARCH_AREA: "Research Area",
  SEARCH_QUERY: "Search Query",
} as const;

// Agent Roles
export const AGENT_ROLES = {
  RESEARCH_PLANNER: "Research Planner",
  SOURCE_HUNTER_A: "Source Hunter A",
  SOURCE_HUNTER_B: "Source Hunter B",
  SOURCE_CRITIC: "Source Critic",
  SYNTHESIZER: "Synthesizer",
  SKEPTIC: "Skeptic",
  MODERATOR: "Moderator",
  FINAL_SYNTHESIZER: "Final Synthesizer",
} as const;

// Debate Rounds
export const DEBATE_ROUNDS = {
  OPENING_STATEMENTS: "Opening Statements",
  CROSS_EXAMINATION: "Cross-Examination",
  REBUTTAL: "Rebuttal & Refinement",
  FINAL_POSITIONS: "Final Positions",
} as const;

// Session Status
export const SESSION_STATUS = {
  IDLE: "idle",
  PLANNING: "planning",
  HUNTING: "hunting",
  CRITIQUING: "critiquing",
  DEBATING: "debating",
  MODERATING: "moderating",
  FINALIZING: "finalizing",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

// Debate Round Types
export const DEBATE_ROUND_TYPES = {
  OPENING: "opening",
  CROSS_EXAM: "cross_exam",
  REBUTTAL: "rebuttal",
  FINAL: "final",
} as const;

// Type Definitions
export type DomainTerm = typeof DOMAIN_TERMS[keyof typeof DOMAIN_TERMS];
export type AgentRole = typeof AGENT_ROLES[keyof typeof AGENT_ROLES];
export type DebateRound = typeof DEBATE_ROUNDS[keyof typeof DEBATE_ROUNDS];
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];
export type DebateRoundType = typeof DEBATE_ROUND_TYPES[keyof typeof DEBATE_ROUND_TYPES];

// Helper Functions
export function isValidAgentRole(role: string): role is AgentRole {
  return Object.values(AGENT_ROLES).includes(role as AgentRole);
}

export function isValidSessionStatus(status: string): status is SessionStatus {
  return Object.values(SESSION_STATUS).includes(status as SessionStatus);
}

export function isValidDebateRound(round: string): round is DebateRound {
  return Object.values(DEBATE_ROUNDS).includes(round as DebateRound);
}

// Reverse lookups (for UI display)
export const AGENT_ROLE_LABELS: Record<AgentRole, string> = {
  [AGENT_ROLES.RESEARCH_PLANNER]: "Research Planner",
  [AGENT_ROLES.SOURCE_HUNTER_A]: "Source Hunter A",
  [AGENT_ROLES.SOURCE_HUNTER_B]: "Source Hunter B",
  [AGENT_ROLES.SOURCE_CRITIC]: "Source Critic",
  [AGENT_ROLES.SYNTHESIZER]: "Synthesizer",
  [AGENT_ROLES.SKEPTIC]: "Skeptic",
  [AGENT_ROLES.MODERATOR]: "Moderator",
  [AGENT_ROLES.FINAL_SYNTHESIZER]: "Final Synthesizer",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  [SESSION_STATUS.IDLE]: "Idle",
  [SESSION_STATUS.PLANNING]: "Planning",
  [SESSION_STATUS.HUNTING]: "Hunting Sources",
  [SESSION_STATUS.CRITIQUING]: "Critiquing Sources",
  [SESSION_STATUS.DEBATING]: "Debating",
  [SESSION_STATUS.MODERATING]: "Moderating",
  [SESSION_STATUS.FINALIZING]: "Finalizing",
  [SESSION_STATUS.COMPLETE]: "Complete",
  [SESSION_STATUS.ERROR]: "Error",
};

