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

async function executeCritiquingPhase(
  sources: Source[],
  question: string,
  onEvent: EventCallback
): Promise<Source[]> {
  const critiquedSources = await critiqueSources(sources, question);
  onEvent({ type: "sources", data: critiquedSources });
  return critiquedSources;
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

function handleOrchestrationError(
  error: unknown,
  sessionId: string,
  currentSession: Session,
  onEvent: EventCallback
): Session {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error(`[Orchestrator] Error for session ${sessionId}:`, errorMessage);
  if (error instanceof Error && error.stack) {
    console.error(`[Orchestrator] Stack trace:`, error.stack);
  }
  onEvent({
    type: "error",
    data: { error: errorMessage },
  });
  return { ...currentSession, status: SESSION_STATUS.ERROR };
}

async function executeFullOrchestration(
  session: Session,
  onEvent: EventCallback
): Promise<Session> {
  const session1 = updateSessionStatus(session, SESSION_STATUS.PLANNING, onEvent);
  console.log(`[Orchestrator] Status updated to PLANNING`);
  const plan = await executePlanningPhase(session1, onEvent);
  console.log(`[Orchestrator] Planning phase complete`);

  const session2 = updateSessionStatus(session1, SESSION_STATUS.HUNTING, onEvent);
  const rawSources = await executeHuntingPhase(plan, onEvent);

  const session3 = updateSessionStatus(session2, SESSION_STATUS.CRITIQUING, onEvent);
  const sources = await executeCritiquingPhase(rawSources, session3.question, onEvent);

  const session4 = updateSessionStatus(session3, SESSION_STATUS.DEBATING, onEvent);
  const answer = await executeSynthesisPhase(session4.question, plan, sources, onEvent);

  const finalSession: Session = {
    ...session4,
    plan,
    sources,
    answer,
    status: SESSION_STATUS.COMPLETE,
    updatedAt: new Date(),
  };
  onEvent({ type: "status", data: { status: SESSION_STATUS.COMPLETE } });

  return finalSession;
}

export async function runBasicOrchestration(
  session: Session,
  onEvent: EventCallback
): Promise<Session> {
  const currentSession = { ...session };
  console.log(`[Orchestrator] Starting orchestration for session ${session.id}`);

  try {
    return await executeFullOrchestration(currentSession, onEvent);
  } catch (error) {
    return handleOrchestrationError(error, session.id, currentSession, onEvent);
  }
}

async function createResearchPlan(question: string): Promise<ResearchPlan> {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are a Research Planner. Break down research questions into a structured plan with specific search texts.",
    },
    {
      role: "user" as const,
      content: `Create a research plan for: ${question}\n\nProvide:\n1. A structured plan (2-3 sentences)\n2. 3-5 specific search texts (one per line, prefixed with "- " )`,
    },
  ];

  console.log(`[Orchestrator] Creating research plan for: ${question.substring(0, 50)}...`);
  const plannerMessage = await callAgent(AGENT_ROLES.RESEARCH_PLANNER, messages);
  console.log(`[Orchestrator] Research plan created (${plannerMessage.length} chars)`);
  const lines = plannerMessage.split("\n").filter((line) => line.trim());
  const planText = lines
    .filter((line) => !line.startsWith("-"))
    .join(" ")
    .trim();
  const searchTexts = lines
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((text) => text.length > 0);

  return {
    plan: planText || plannerMessage.substring(0, 200),
    searchQueries: searchTexts.length > 0 ? searchTexts : [question],
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
      content: `Find sources for these search texts:\n${plan.searchQueries
        .map((text) => `- ${text}`)
        .join("\n")}\n\nReturn JSON array: [{"title": "...", "url": "...", "snippet": "..."}]`,
    },
  ];

  // Run both hunters in parallel
  const [hunterAMessage, hunterBMessage] = await Promise.all([
    callAgent(AGENT_ROLES.SOURCE_HUNTER_A, messages),
    callAgent(AGENT_ROLES.SOURCE_HUNTER_B, messages),
  ]);

  const allSources: Source[] = [];

  // Parse Hunter A results
  try {
    const jsonMatch = hunterAMessage.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Source[];
      parsed.slice(0, 6).forEach((source) => {
        allSources.push({ ...source, hunter: "A" });
      });
    }
  } catch {
    // Continue if parsing fails
  }

  // Parse Hunter B results
  try {
    const jsonMatch = hunterBMessage.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Source[];
      parsed.slice(0, 6).forEach((source) => {
        allSources.push({ ...source, hunter: "B" });
      });
    }
  } catch {
    // Continue if parsing fails
  }

  // Deduplicate by URL and return up to 8 sources
  const uniqueSources = Array.from(new Map(allSources.map((s) => [s.url, s])).values()).slice(0, 8);

  // Fallback if no sources found
  if (uniqueSources.length === 0) {
    return plan.searchQueries.slice(0, 4).map((text, idx) => ({
      title: `Source for: ${text}`,
      url: `https://example.com/source-${idx + 1}`,
      snippet: `Relevant information about ${text}`,
      hunter: "A" as const,
    }));
  }

  return uniqueSources;
}

export async function critiqueSources(sources: Source[], question: string): Promise<Source[]> {
  console.log(`[Orchestrator] Critiquing ${sources.length} sources`);
  const critiquedSources: Source[] = [];

  for (const source of sources) {
    try {
      const messages = [
        {
          role: "system" as const,
          content:
            "You are a Source Critic. Evaluate the quality and relevance of research sources. Rate each source on a 1-5 scale and provide a brief critique.",
        },
        {
          role: "user" as const,
          content: `Research Question: ${question}\n\nSource:\nTitle: ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet}\n\nProvide:\n1. Quality rating (1-5, where 5 is highest)\n2. Brief critique (2-3 sentences)\n\nFormat: Rating: X\nCritique: ...`,
        },
      ];

      const critiqueMessage = await callAgent(AGENT_ROLES.SOURCE_CRITIC, messages);
      const ratingMatch = critiqueMessage.match(/Rating:\s*(\d)/i);
      const critiqueMatch = critiqueMessage.match(/Critique:\s*(.+)/is);

      const qualityRating = ratingMatch && ratingMatch[1] ? parseInt(ratingMatch[1], 10) : 3;
      const critique =
        critiqueMatch && critiqueMatch[1] ? critiqueMatch[1].trim() : "No critique available";

      critiquedSources.push({
        ...source,
        qualityRating: Math.max(1, Math.min(5, qualityRating)) as number,
        critique: critique as string,
      });
    } catch (error) {
      console.error(`[Orchestrator] Error critiquing source ${source.title}:`, error);
      // Include source without critique if critique fails
      critiquedSources.push({
        ...source,
        qualityRating: 3,
        critique: "Critique unavailable",
      });
    }
  }

  console.log(`[Orchestrator] Source critique complete`);
  return critiquedSources;
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
