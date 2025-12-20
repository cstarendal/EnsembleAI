import type { SessionStatus } from "../constants/ubiquitousLanguage.js";

export interface DebateTopic {
  topic: string;
}

export interface InitialContext {
  context?: string; // Optional background/context for the debate
  agentRole?: string;
  agent?: string;
}

export interface Context {
  title: string;
  url?: string; // Optional - may not have URL if from training data
  snippet: string;
}

export interface AgentMessage {
  role: string;
  content: string;
  agent?: string; // Display name of the agent that generated this message
  timestamp: Date;
}

export type DebateRoundType = "pitch" | "cross_fire" | "stress_test" | "steel_man" | "consensus";
export type DebatePosition = "for" | "against" | "neutral" | "mixed";

export interface DebateMessage {
  id: string;
  role: string; // Agent role (e.g., "Synthesizer", "Skeptic", "Source Critic")
  personaId?: string; // ID of the specific persona (e.g. "visionary")
  agent: string; // Display name of the agent
  round: DebateRoundType;
  roundNumber: number; // 1-5 in the full flow
  target?: string; // Who the message is directed to (agent role or "all")
  content: string;
  position?: DebatePosition;
  keyPoints?: string[]; // Main arguments/points
  revisions?: string; // What changed from previous round
  confidenceScore?: number; // 0-100 score for consensus
  timestamp: Date;
}

export interface SessionParticipant {
  personaId: string;
  name: string;
  role: string;
  description: string;
  providerId: string;
  agent: string; // Display label including provider identity
  isWildcard: boolean;
}

export interface Session {
  id: string;
  topic: string;
  status: SessionStatus;
  context?: InitialContext; // Optional initial context
  contexts?: Context[]; // Optional contexts for the debate
  messages: AgentMessage[];
  participants?: SessionParticipant[]; // The specific participants selected for this session
  debate?: DebateMessage[]; // Structured debate messages
  conclusion?: string;
  conclusionAgentRole?: string; // "Final Synthesizer"
  conclusionAgent?: string; // Display name of the agent that generated the conclusion
  createdAt: Date;
  updatedAt: Date;
}
