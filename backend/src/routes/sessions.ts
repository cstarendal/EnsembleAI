import express from "express";
import { z } from "zod";
import { runBasicOrchestration } from "../orchestrator/basicOrchestrator.js";
import type { Session, AgentMessage, DebateMessage } from "../types/session.js";
import { SESSION_STATUS } from "../constants/ubiquitousLanguage.js";
import type { OrchestratorEvent } from "../orchestrator/basicOrchestrator.js";

const router = express.Router();

const sessions = new Map<string, Session>();

type SseSend = (event: string, data: unknown) => void;
const subscribers = new Map<string, Set<SseSend>>();

const topicSchema = z.object({
  topic: z.string().min(10).max(1000),
  contexts: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().optional(),
        snippet: z.string(),
      })
    )
    .optional(),
});

function createSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function publish(sessionId: string, event: string, data: unknown): void {
  const subs = subscribers.get(sessionId);
  if (!subs) return;
  subs.forEach((send) => send(event, data));
}

function subscribe(sessionId: string, send: SseSend): () => void {
  const set = subscribers.get(sessionId) ?? new Set<SseSend>();
  set.add(send);
  subscribers.set(sessionId, set);

  return () => {
    const current = subscribers.get(sessionId);
    if (!current) return;
    current.delete(send);
    if (current.size === 0) subscribers.delete(sessionId);
  };
}

function applyEventToSession(session: Session, event: OrchestratorEvent): Session {
  const updated: Session = { ...session, updatedAt: new Date() };

  if (event.type === "status") {
    const status = (event.data as { status: Session["status"] }).status;
    updated.status = status;
  }

  if (event.type === "conclusion") {
    updated.conclusion = (event.data as { conclusion: string }).conclusion;
  }

  if (event.type === "message") {
    const message = event.data as AgentMessage;
    updated.messages = [...(updated.messages || []), message];
  }

  if (event.type === "debate_message") {
    const msg = event.data as DebateMessage;
    updated.debate = [...(updated.debate || []), msg];
  }

  if (event.type === "debate") {
    updated.debate = event.data as DebateMessage[];
  }

  if (event.type === "participants") {
    updated.participants = event.data as Session["participants"];
  }

  return updated;
}

function startOrchestrationInBackground(sessionId: string, session: Session): void {
  if (process.env.NODE_ENV === "test") return;

  console.log(`[Sessions] Starting orchestration for session ${sessionId}`);
  void runBasicOrchestration(session, (event) => {
    const current = sessions.get(sessionId);
    if (!current) {
      console.warn(`[Sessions] Session ${sessionId} not found when applying event ${event.type}`);
      return;
    }

    const updated = applyEventToSession(current, event);
    sessions.set(sessionId, updated);
    console.log(
      `[Sessions] Event ${event.type} applied to session ${sessionId}, status: ${updated.status}`
    );

    const sseEventName = event.type === "error" ? "orchestrator_error" : event.type;

    publish(sessionId, sseEventName, event.data);

    if (updated.status === SESSION_STATUS.COMPLETE) {
      publish(sessionId, "complete", { status: updated.status });
    }

    if (updated.status === SESSION_STATUS.ERROR) {
      publish(sessionId, "complete", { status: updated.status });
    }
  }).catch((error: unknown) => {
    console.error(`[Sessions] Orchestration error for ${sessionId}:`, error);
    if (error instanceof Error) {
      console.error(`[Sessions] Error stack:`, error.stack);
    }

    const current = sessions.get(sessionId);
    if (!current) return;
    const updated: Session = { ...current, status: SESSION_STATUS.ERROR, updatedAt: new Date() };
    sessions.set(sessionId, updated);
    publish(sessionId, "orchestrator_error", { error: "Orchestration failed" });
    publish(sessionId, "complete", { status: updated.status });
  });
}

router.post("/", (req, res) => {
  try {
    const parsed = topicSchema.parse(req.body);
    const sessionId = createSessionId();

    const session: Session = {
      id: sessionId,
      topic: parsed.topic,
      status: SESSION_STATUS.IDLE,
      contexts: parsed.contexts,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    sessions.set(sessionId, session);

    res.status(201).json({ sessionId, status: session.status });

    startOrchestrationInBackground(sessionId, session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || "Validation error" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:sessionId/stream", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send: SseSend = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // initial snapshot
  send("status", { status: session.status });
  if (session.context) send("context", session.context);
  if (session.contexts) send("contexts", session.contexts);
  if (session.participants) send("participants", session.participants);
  if (session.debate) {
    session.debate.forEach((msg) => send("debate_message", msg));
  }
  if (session.conclusion) send("conclusion", { conclusion: session.conclusion });

  const unsubscribe = subscribe(sessionId, send);

  req.on("close", () => {
    unsubscribe();
  });
});

router.get("/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(session);
});

export default router;
