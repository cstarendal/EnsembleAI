import express from "express";
import cors from "cors";
import sessionsRouter from "./routes/sessions.js";

export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "Ensemble AI Research System API",
      version: "0.1.0",
      status: "running",
      endpoints: {
        health: "GET /health",
        sessions: {
          create: "POST /api/sessions",
          get: "GET /api/sessions/:sessionId",
          stream: "GET /api/sessions/:sessionId/stream",
        },
      },
    });
  });

  app.use("/api/sessions", sessionsRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
