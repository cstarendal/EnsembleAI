import type { SessionStatus } from "../constants/ubiquitousLanguage.js";

export interface ResearchQuestion {
  question: string;
}

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
  timestamp: Date;
}

export interface Session {
  id: string;
  question: string;
  status: SessionStatus;
  plan?: ResearchPlan;
  sources?: Source[];
  messages: AgentMessage[];
  answer?: string;
  answerAgentRole?: string; // "Synthesizer"
  answerAgent?: string; // Display name of the agent that generated the answer
  createdAt: Date;
  updatedAt: Date;
}
