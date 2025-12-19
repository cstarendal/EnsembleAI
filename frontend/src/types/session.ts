export interface ResearchPlan {
  plan: string;
  searchQueries: string[];
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
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
