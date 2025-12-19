import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";

const app = createApp();

describe("POST /api/sessions", () => {
  it("creates a session with valid question", async () => {
    const response = await request(app)
      .post("/api/sessions")
      .send({ question: "What are the effects of universal basic income?" })
      .expect(201);

    expect(response.body).toHaveProperty("sessionId");
    expect(response.body).toHaveProperty("status");
  });

  it("rejects question that is too short", async () => {
    const response = await request(app)
      .post("/api/sessions")
      .send({ question: "short" })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });

  it("rejects question that is too long", async () => {
    const longQuestion = "a".repeat(1001);
    const response = await request(app)
      .post("/api/sessions")
      .send({ question: longQuestion })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });
});

describe("GET /api/sessions/:sessionId", () => {
  it("returns 404 for non-existent session", async () => {
    await request(app).get("/api/sessions/invalid-id").expect(404);
  });
});
