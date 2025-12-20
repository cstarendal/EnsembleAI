export interface ResearchPlan {
  plan: string;
  searchQueries: string[];
  agentRole?: string; // "Research Planner"
  agent?: string; // Display name of the agent (e.g., "GPT 4o Mini")
}

export interface Source {
  title: string;
  url?: string; // Optional - may not have URL if from training data
  snippet: string;
  qualityRating?: number; // 1-5 scale
  critique?: string; // Source Critic's research notes
  hunter?: "A" | "B"; // Which hunter found this source
  hunterAgent?: string; // Display name of the hunter agent
  criticAgent?: string; // Display name of the critic agent
}

export interface AgentMessage {
  role: string;
  content: string;
  agent?: string; // Display name of the agent that generated this message
  timestamp: string;
}

export type DebateRoundType = "opening" | "cross_exam" | "rebuttal" | "final";
export type DebatePosition = "for" | "against" | "neutral" | "mixed";

export interface DebateMessage {
  id: string;
  role: string; // Agent role (e.g., "Synthesizer", "Skeptic", "Source Critic")
  agent: string; // Display name of the agent
  round: DebateRoundType;
  roundNumber: number; // 3-6 in the full flow
  target?: string; // Who the message is directed to (agent role or "all")
  content: string;
  position?: DebatePosition;
  keyPoints?: string[]; // Main arguments/points
  revisions?: string; // What changed from previous round
  timestamp: string;
}

export interface Session {
  id: string;
  question: string;
  status: string;
  plan?: ResearchPlan;
  sources?: Source[];
  messages: AgentMessage[];
  debate?: DebateMessage[]; // Structured debate messages
  answer?: string;
  answerAgentRole?: string; // "Synthesizer"
  answerAgent?: string; // Display name of the agent that generated the answer
  createdAt: string;
  updatedAt: string;
}
