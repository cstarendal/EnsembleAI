import express from "express";
import cors from "cors";
import sessionsRouter from "./routes/sessions.js";

export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/sessions", sessionsRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
