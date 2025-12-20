export interface ResearchPlan {
  plan: string;
  searchQueries: string[];
  agentRole?: string; // "Research Planner"
  model?: string; // "GPT 4o Mini"
}

export interface Source {
  title: string;
  url?: string; // Optional - may not have URL if from training data
  snippet: string;
  qualityRating?: number; // 1-5 scale
  critique?: string; // Source Critic's analysis
  hunter?: "A" | "B"; // Which hunter found this source
  hunterModel?: string; // "GPT 4o" or "Claude 3.5 Sonnet"
  criticModel?: string; // "Mistral Large"
}

export interface AgentMessage {
  role: string;
  content: string;
  model?: string; // Model that generated this message
  timestamp: string;
}

export interface Session {
  id: string;
  question: string;
  status: string;
  plan?: ResearchPlan;
  sources?: Source[];
  messages: AgentMessage[];
  answer?: string;
  answerAgentRole?: string; // "Synthesizer"
  answerModel?: string; // "GPT 4o"
  createdAt: string;
  updatedAt: string;
}
