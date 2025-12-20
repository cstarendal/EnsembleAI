import { callAgent, getAgentDisplayName } from "../api/openRouter.js";
import type { Session, Context, DebateMessage, SessionParticipant } from "../types/session.js";
import { AGENT_ROLES, SESSION_STATUS } from "../constants/ubiquitousLanguage.js";
import { runDebate } from "./debateOrchestrator.js";

export interface OrchestratorEvent {
  type:
    | "status"
    | "message"
    | "participants"
    | "debate_message"
    | "debate"
    | "conclusion"
    | "error";
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

async function executeDebatePhase(
  sessionId: string,
  topic: string,
  contexts: Context[],
  onEvent: EventCallback
): Promise<{ messages: DebateMessage[]; participants: SessionParticipant[] }> {
  try {
    const result = await runDebate(sessionId, topic, contexts, onEvent);
    onEvent({ type: "debate", data: result.messages });
    return result;
  } catch (error) {
    console.error(`[Orchestrator] Debate round error:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    onEvent({
      type: "error",
      data: { error: `Debate round failed: ${errorMessage}` },
    });
    throw error; // Re-throw to trigger orchestration error handler
  }
}

async function synthesizeConclusion(
  topic: string,
  debateMessages: DebateMessage[],
  onEvent: EventCallback
): Promise<string> {
  const debateSynthesis = formatDebateSynthesis(debateMessages);

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a Final Synthesizer. Based on the debate that has occurred, synthesize a clear conclusion that reflects the key arguments, agreements, disagreements, and final positions of all participants.",
    },
    {
      role: "user" as const,
      content: `Debate Topic: ${topic}\n\nDebate Synthesis:\n${debateSynthesis}\n\nProvide a comprehensive conclusion (3-5 paragraphs) that:\n1. Synthesizes the main positions\n2. Highlights areas of agreement and disagreement\n3. Presents the final collective understanding\n4. Acknowledges remaining uncertainties`,
    },
  ];

  const conclusion = await callAgent(AGENT_ROLES.FINAL_SYNTHESIZER, messages);
  onEvent({ type: "conclusion", data: { conclusion } });
  return conclusion;
}

function formatDebateSynthesis(debateMessages: DebateMessage[]): string {
  const byRound = {
    pitch: debateMessages.filter((m) => m.round === "pitch"),
    cross_fire: debateMessages.filter((m) => m.round === "cross_fire"),
    stress_test: debateMessages.filter((m) => m.round === "stress_test"),
    steel_man: debateMessages.filter((m) => m.round === "steel_man"),
    consensus: debateMessages.filter((m) => m.round === "consensus"),
  };

  let synthesis = "";

  if (byRound.pitch.length > 0) {
    synthesis += "The Pitch (Round 1):\n";
    byRound.pitch.forEach((msg) => {
      synthesis += `- ${msg.role} (${msg.position || "neutral"}): ${msg.content.substring(0, 200)}...\n`;
    });
    synthesis += "\n";
  }

  if (byRound.cross_fire.length > 0) {
    synthesis += "Cross-Fire (Round 2):\n";
    byRound.cross_fire.forEach((msg) => {
      synthesis += `- ${msg.role} → ${msg.target}: ${msg.content.substring(0, 200)}...\n`;
    });
    synthesis += "\n";
  }

  if (byRound.stress_test.length > 0) {
    synthesis += "Stress Test (Round 3):\n";
    byRound.stress_test.forEach((msg) => {
      synthesis += `- ${msg.role}: ${msg.content.substring(0, 200)}...\n`;
    });
    synthesis += "\n";
  }

  if (byRound.consensus.length > 0) {
    synthesis += "Consensus (Round 5):\n";
    byRound.consensus.forEach((msg) => {
      synthesis += `- ${msg.role} (Conf: ${msg.confidenceScore}%): ${msg.content.substring(0, 200)}...\n`;
    });
  }

  return synthesis;
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
  // Start directly with debate
  const session1 = updateSessionStatus(session, SESSION_STATUS.DEBATING, onEvent);
  console.log(`[Orchestrator] Status updated to DEBATING`);

  // Run debate with optional contexts
  const { messages: debate, participants } = await executeDebatePhase(
    session1.id,
    session1.topic,
    session1.contexts || [],
    onEvent
  );
  console.log(`[Orchestrator] Debate complete with ${debate.length} messages`);

  // Generate conclusion from debate
  const session2 = updateSessionStatus(session1, SESSION_STATUS.FINALIZING, onEvent);
  const conclusion = await synthesizeConclusion(session2.topic, debate, onEvent);

  const finalSession: Session = {
    ...session2,
    participants,
    debate,
    conclusion,
    conclusionAgentRole: AGENT_ROLES.FINAL_SYNTHESIZER,
    conclusionAgent: getAgentDisplayName(AGENT_ROLES.FINAL_SYNTHESIZER),
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
