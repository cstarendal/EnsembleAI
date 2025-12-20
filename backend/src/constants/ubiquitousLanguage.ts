// Core Domain Concepts
export const DOMAIN_TERMS = {
  TOPIC: "Topic",
  SESSION: "Session",
  AGENT: "Agent",
  ROLE: "Role",
  DEBATE: "Debate",
  ROUND: "Round",
  CONTEXT: "Context",
  SYNTHESIS: "Synthesis",
  CONCLUSION: "Conclusion",
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
} as const;

// Agent Roles
export const AGENT_ROLES = {
  SYNTHESIZER: "Synthesizer",
  SKEPTIC: "Skeptic",
  MODERATOR: "Moderator",
  FINAL_SYNTHESIZER: "Final Synthesizer",
  // Keep SOURCE_CRITIC for now as it's used in debate participants
  SOURCE_CRITIC: "Source Critic",
  WILDCARD: "Wildcard",
} as const;

// Session Status
export const SESSION_STATUS = {
  IDLE: "idle",
  DEBATING: "debating",
  MODERATING: "moderating",
  FINALIZING: "finalizing",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

// Debate Round Types
export const DEBATE_ROUND_TYPES = {
  PITCH: "pitch",
  CROSS_FIRE: "cross_fire",
  STRESS_TEST: "stress_test",
  STEEL_MAN: "steel_man",
  CONSENSUS: "consensus",
} as const;

// Type Definitions
export type DomainTerm = (typeof DOMAIN_TERMS)[keyof typeof DOMAIN_TERMS];
export type AgentRole = (typeof AGENT_ROLES)[keyof typeof AGENT_ROLES];
export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
export type DebateRoundType = (typeof DEBATE_ROUND_TYPES)[keyof typeof DEBATE_ROUND_TYPES];

// Helper Functions
export function isValidAgentRole(role: string): role is AgentRole {
  return Object.values(AGENT_ROLES).includes(role as AgentRole);
}

export function isValidSessionStatus(status: string): status is SessionStatus {
  return Object.values(SESSION_STATUS).includes(status as SessionStatus);
}
