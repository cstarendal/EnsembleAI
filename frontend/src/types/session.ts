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
  timestamp: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface SessionParticipant {
  personaId: string;
  name: string;
  role: string;
  description: string;
  providerId: string;
  agent: string;
  isWildcard: boolean;
}

export type DebateRoundType = "pitch" | "cross_fire" | "stress_test" | "steel_man" | "consensus";
export type DebatePosition = "for" | "against" | "neutral" | "mixed";

export interface DebateMessage {
  id: string;
  role: string; // Agent role (e.g., "Synthesizer", "Skeptic", "Source Critic")
  personaId?: string;
  agent: string; // Display name of the agent
  round: DebateRoundType;
  roundNumber: number; // 1-5 in the full flow
  target?: string; // Who the message is directed to (agent role or "all")
  content: string;
  position?: DebatePosition;
  keyPoints?: string[]; // Main arguments/points
  revisions?: string; // What changed from previous round
  confidenceScore?: number;
  timestamp: string;
}

export interface Session {
  id: string;
  topic: string;
  status: string;
  context?: InitialContext; // Optional initial context
  contexts?: Context[]; // Optional contexts for the debate
  messages: AgentMessage[];
  participants?: SessionParticipant[];
  debate?: DebateMessage[]; // Structured debate messages
  conclusion?: string;
  conclusionAgentRole?: string; // "Final Synthesizer"
  conclusionAgent?: string; // Display name of the agent that generated the conclusion
  createdAt: string;
  updatedAt: string;
}
