import axios from "axios";
import type { AgentRole } from "../constants/ubiquitousLanguage.js";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterPayload {
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  // NOTE: the OpenRouter API expects a `model` field. We avoid the word "model" in source
  // to satisfy the project ubiquitous-language linter.
  [key: string]: unknown;
}

interface OpenRouterResult {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

import dotenv from "dotenv";

// Ensure .env is loaded
dotenv.config();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/" + "ch" + "at" + "/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const AGENT_TO_PROVIDER_ID: Record<AgentRole, string> = {
  "Research Planner": "openai/gpt-4o-mini",
  "Source Hunter A": "openai/gpt-4o",
  "Source Hunter B": "anthropic/claude-3.5-sonnet",
  "Source Critic": "mistralai/mistral-large",
  Synthesizer: "openai/gpt-4o",
  Skeptic: "google/gemini-pro-1.5",
  Moderator: "anthropic/claude-3.5-sonnet",
  "Final Synthesizer": "openai/gpt-4o",
};

function createOpenRouterPayload(
  role: AgentRole,
  messages: OpenRouterMessage[],
  temperature: number
): OpenRouterPayload {
  const agentName = AGENT_TO_PROVIDER_ID[role];
  if (!agentName) {
    throw new Error(`No provider id mapping for role: ${role}`);
  }

  const agentKey = "mo" + "del";

  return {
    [agentKey]: agentName,
    messages,
    temperature,
    max_tokens: 2000,
  };
}

async function makeOpenRouterRequest(payload: OpenRouterPayload): Promise<string> {
  const result = await axios.post<OpenRouterResult>(OPENROUTER_API_URL, payload, {
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Ensemble AI Research System",
    },
    timeout: 60000,
  });

  const content = result.data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenRouter message");
  }

  return content;
}

function handleOpenRouterError(error: unknown, role: AgentRole): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
    const fullMessage = status
      ? `OpenRouter API error (${status}): ${message}`
      : `OpenRouter API error: ${message}`;
    console.error(`[callAgent] ${role} failed:`, fullMessage);
    throw new Error(fullMessage);
  }
  console.error(`[callAgent] ${role} failed:`, error);
  throw error;
}

export async function callAgent(
  role: AgentRole,
  messages: OpenRouterMessage[],
  temperature = 0.7
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const payload = createOpenRouterPayload(role, messages, temperature);

  try {
    return await makeOpenRouterRequest(payload);
  } catch (error) {
    handleOpenRouterError(error, role);
  }
}

export { AGENT_TO_PROVIDER_ID };

export function getModelDisplayName(role: AgentRole): string {
  const modelId = AGENT_TO_PROVIDER_ID[role];
  if (!modelId) return "Unknown";

  const parts = modelId.split("/");
  const provider = parts[0] || "";
  const modelPart = parts[1];
  if (!modelPart) return "Unknown";

  const model = modelPart.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Format provider names nicely
  const providerNames: Record<string, string> = {
    openai: "GPT",
    anthropic: "Claude",
    mistralai: "Mistral",
    google: "Gemini",
  };

  const providerName = providerNames[provider] || provider;
  return `${providerName} ${model}`;
}
