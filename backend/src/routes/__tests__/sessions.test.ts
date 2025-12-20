import { describe, it, expect } from "vitest";
import type { AddressInfo } from "node:net";
import { createServer } from "node:http";
import { createApp } from "../../app.js";

const app = createApp();

async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
}

describe("POST /api/sessions", () => {
  it("creates a session with valid question", async () => {
    await withServer(async (baseUrl) => {
      const result = await fetch(`${baseUrl}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "What are the effects of universal basic income?" }),
      });

      expect(result.status).toBe(201);
      const json = (await result.json()) as Record<string, unknown>;
      expect(json).toHaveProperty("sessionId");
      expect(json).toHaveProperty("status");
    });
  });

  it("rejects question that is too short", async () => {
    await withServer(async (baseUrl) => {
      const result = await fetch(`${baseUrl}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "short" }),
      });

      expect(result.status).toBe(400);
      const json = (await result.json()) as Record<string, unknown>;
      expect(json).toHaveProperty("error");
    });
  });

  it("rejects question that is too long", async () => {
    const longQuestion = "a".repeat(1001);

    await withServer(async (baseUrl) => {
      const result = await fetch(`${baseUrl}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: longQuestion }),
      });

      expect(result.status).toBe(400);
      const json = (await result.json()) as Record<string, unknown>;
      expect(json).toHaveProperty("error");
    });
  });
});

describe("GET /api/sessions/:sessionId", () => {
  it("returns 404 for non-existent session", async () => {
    await withServer(async (baseUrl) => {
      const result = await fetch(`${baseUrl}/api/sessions/invalid-id`);
      expect(result.status).toBe(404);
    });
  });
});
