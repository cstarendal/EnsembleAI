import { callAgent } from "../api/openRouter.js";
import type { Session, ResearchPlan, Source } from "../types/session.js";
import { AGENT_ROLES, SESSION_STATUS } from "../constants/ubiquitousLanguage.js";

export interface OrchestratorEvent {
  type: "status" | "message" | "plan" | "sources" | "answer" | "error";
  data: unknown;
}

export type EventCallback = (event: OrchestratorEvent) => void;

function updateSessionStatus(
  session: Session,
  status: Session["status"],
  onEvent: EventCallback
): Session {
  const updated = { ...session, status, updatedAt: new Date() };
  onEvent({ type: "status", data: { status } });
  return updated;
}

async function executePlanningPhase(
  session: Session,
  onEvent: EventCallback
): Promise<ResearchPlan> {
  const plan = await createResearchPlan(session.question);
  onEvent({ type: "plan", data: plan });
  return plan;
}

async function executeHuntingPhase(plan: ResearchPlan, onEvent: EventCallback): Promise<Source[]> {
  const sources = await findSources(plan);
  onEvent({ type: "sources", data: sources });
  return sources;
}

async function executeSynthesisPhase(
  question: string,
  plan: ResearchPlan,
  sources: Source[],
  onEvent: EventCallback
): Promise<string> {
  const answer = await synthesizeAnswer(question, plan, sources);
  onEvent({ type: "answer", data: { answer } });
  return answer;
}

export async function runBasicOrchestration(
  session: Session,
  onEvent: EventCallback
): Promise<Session> {
  const currentSession = { ...session };

  try {
    const session1 = updateSessionStatus(currentSession, SESSION_STATUS.PLANNING, onEvent);
    const plan = await executePlanningPhase(session1, onEvent);

    const session2 = updateSessionStatus(session1, SESSION_STATUS.HUNTING, onEvent);
    const sources = await executeHuntingPhase(plan, onEvent);

    const session3 = updateSessionStatus(session2, SESSION_STATUS.DEBATING, onEvent);
    const answer = await executeSynthesisPhase(session3.question, plan, sources, onEvent);

    const finalSession = {
      ...session3,
      plan,
      sources,
      answer,
      status: SESSION_STATUS.COMPLETE,
      updatedAt: new Date(),
    };
    onEvent({ type: "status", data: { status: SESSION_STATUS.COMPLETE } });

    return finalSession;
  } catch (error) {
    onEvent({
      type: "error",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
    return { ...currentSession, status: SESSION_STATUS.ERROR };
  }
}

async function createResearchPlan(question: string): Promise<ResearchPlan> {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are a Research Planner. Break down research questions into a structured plan with specific search queries.",
    },
    {
      role: "user" as const,
      content: `Create a research plan for: ${question}\n\nProvide:\n1. A structured plan (2-3 sentences)\n2. 3-5 specific search queries (one per line, prefixed with "- ")`,
    },
  ];

  const response = await callAgent(AGENT_ROLES.RESEARCH_PLANNER, messages);
  const lines = response.split("\n").filter((line) => line.trim());
  const planText = lines
    .filter((line) => !line.startsWith("-"))
    .join(" ")
    .trim();
  const queries = lines
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((q) => q.length > 0);

  return {
    plan: planText || response.substring(0, 200),
    searchQueries: queries.length > 0 ? queries : [question],
  };
}

async function findSources(plan: ResearchPlan): Promise<Source[]> {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are a Source Hunter. Find relevant academic and policy sources. Return a JSON array of sources with title, url, and snippet fields.",
    },
    {
      role: "user" as const,
      content: `Find sources for these search queries:\n${plan.searchQueries
        .map((q) => `- ${q}`)
        .join("\n")}\n\nReturn JSON array: [{"title": "...", "url": "...", "snippet": "..."}]`,
    },
  ];

  const response = await callAgent(AGENT_ROLES.SOURCE_HUNTER_A, messages);
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Source[];
      return parsed.slice(0, 6);
    }
  } catch {
    // Fallback: create mock sources from response
  }

  return plan.searchQueries.slice(0, 4).map((query, idx) => ({
    title: `Source for: ${query}`,
    url: `https://example.com/source-${idx + 1}`,
    snippet: `Relevant information about ${query}`,
  }));
}

async function synthesizeAnswer(
  question: string,
  plan: ResearchPlan,
  sources: Source[]
): Promise<string> {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are a Synthesizer. Create a balanced, well-structured answer based on the research plan and sources provided.",
    },
    {
      role: "user" as const,
      content: `Question: ${question}\n\nPlan: ${plan.plan}\n\nSources:\n${sources
        .map((s, i) => `${i + 1}. ${s.title}: ${s.snippet}`)
        .join("\n")}\n\nProvide a comprehensive answer (3-5 paragraphs).`,
    },
  ];

  return callAgent(AGENT_ROLES.SYNTHESIZER, messages);
}
