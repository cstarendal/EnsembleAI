export interface ResearchPlan {
  plan: string;
  searchQueries: string[];
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
  qualityRating?: number; // 1-5 scale
  critique?: string; // Source Critic's analysis
  hunter?: "A" | "B"; // Which hunter found this source
}

export interface AgentMessage {
  role: string;
  content: string;
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
  createdAt: string;
  updatedAt: string;
}
