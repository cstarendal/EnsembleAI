import type { SessionStatus } from "../constants/ubiquitousLanguage.js";

export interface ResearchQuestion {
  question: string;
}

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
  createdAt: Date;
  updatedAt: Date;
}
