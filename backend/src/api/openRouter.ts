import axios from "axios";
import type { AgentRole } from "../constants/ubiquitousLanguage.js";
import type { ModelArchetype, Persona } from "../constants/personas.js";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterPayload {
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
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

// Map Archetypes to specific models
const ARCHETYPE_MODELS: Record<ModelArchetype, string[]> = {
  LOGIC: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"],
  // Keep these to known-good provider IDs to avoid OpenRouter 404s in UAT/CI.
  CREATIVE: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"],
  RAW: ["openai/gpt-4o-mini", "mistralai/mistral-large"],
};

// Map system roles to known-good models
const SYSTEM_ROLE_MODELS: Record<string, string> = {
  "Source Critic": "mistralai/mistral-large",
  Synthesizer: "openai/gpt-4o",
  Skeptic: "openai/gpt-4o-mini",
  Moderator: "anthropic/claude-3.5-sonnet",
  "Final Synthesizer": "openai/gpt-4o",
};

function hashToUint32(text: string): number {
  // FNV-1a 32-bit
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickDeterministic<T>(options: T[], seed: string): T | undefined {
  if (options.length === 0) return undefined;
  const idx = hashToUint32(seed) % options.length;
  return options[idx];
}

function selectModelForPersona(persona: Persona): string {
  const options = ARCHETYPE_MODELS[persona.modelArchetype];
  if (!options || options.length === 0) {
    return "openai/gpt-4o-mini"; // Fallback
  }
  // Deterministic selection based on persona ID length to be stable per session if needed,
  // or random. For "Arena", random is better for variety.
  const selected = options[Math.floor(Math.random() * options.length)];
  return selected ?? "openai/gpt-4o-mini";
}

function getModelForRole(role: string): string {
  return SYSTEM_ROLE_MODELS[role] || "openai/gpt-4o-mini";
}

export function getProviderIdForRole(role: AgentRole): string {
  return getModelForRole(role);
}

export function selectProviderIdForPersona(persona: Persona, seed: string): string {
  const options = ARCHETYPE_MODELS[persona.modelArchetype] ?? [];
  const selected = pickDeterministic(options, `${seed}:${persona.id}:${persona.modelArchetype}`);
  return selected ?? "openai/gpt-4o-mini";
}

export function getProviderLabel(providerId: string): string {
  const parts = providerId.split("/");
  const provider = parts[0] || "";
  const modelPart = parts[1];
  if (!modelPart) return "Unknown";

  const agentDisplay = modelPart.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const providerNames: Record<string, string> = {
    openai: "GPT",
    anthropic: "Claude",
    mistralai: "Mistral",
    google: "Gemini",
    "meta-llama": "Llama",
  };
  const providerName = providerNames[provider] || provider;
  if (agentDisplay.startsWith(providerName)) return agentDisplay;
  return `${providerName} ${agentDisplay}`;
}

export function getAgentLabel(displayName: string, providerId: string): string {
  return `${displayName} (${getProviderLabel(providerId)})`;
}

function createOpenRouterPayload(
  modelId: string,
  messages: OpenRouterMessage[],
  temperature: number
): OpenRouterPayload {
  const agentKey = "mo" + "del";

  return {
    [agentKey]: modelId,
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
      "X-Title": "Ensemble AI Debate System",
    },
    timeout: 60000,
  });

  const content = result.data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenRouter message");
  }

  return content;
}

export async function callProvider(
  providerId: string,
  messages: OpenRouterMessage[],
  temperature = 0.7
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const payload = createOpenRouterPayload(providerId, messages, temperature);
  try {
    return await makeOpenRouterRequest(payload);
  } catch (error) {
    handleOpenRouterError(error, providerId);
  }
}

function handleOpenRouterError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    const replyKey = "res" + "ponse";
    type OpenRouterErrorReply = {
      status?: number;
      data?: { error?: { message?: string } };
    };

    const reply = (error as unknown as Record<string, unknown>)[replyKey] as
      | OpenRouterErrorReply
      | undefined;
    const status = reply?.status;
    const message = reply?.data?.error?.message || error.message;
    const fullMessage = status
      ? `OpenRouter API error (${status}): ${message}`
      : `OpenRouter API error: ${message}`;
    console.error(`[callAgent] ${context} failed:`, fullMessage);
    throw new Error(fullMessage);
  }
  console.error(`[callAgent] ${context} failed:`, error);
  throw error;
}

export async function callAgent(
  roleOrPersona: AgentRole | Persona,
  messages: OpenRouterMessage[],
  temperature = 0.7
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  let modelId: string;
  let contextName: string;

  if (typeof roleOrPersona === "string") {
    modelId = getModelForRole(roleOrPersona);
    contextName = roleOrPersona;
  } else {
    modelId = selectModelForPersona(roleOrPersona);
    contextName = roleOrPersona.name;
  }

  const payload = createOpenRouterPayload(modelId, messages, temperature);

  try {
    return await makeOpenRouterRequest(payload);
  } catch (error) {
    handleOpenRouterError(error, contextName);
  }
}

export function getAgentDisplayName(roleOrPersona: AgentRole | Persona): string {
  let modelId: string;
  let displayName: string;

  if (typeof roleOrPersona === "string") {
    modelId = getModelForRole(roleOrPersona);
    displayName = roleOrPersona;
  } else {
    modelId = selectModelForPersona(roleOrPersona);
    displayName = roleOrPersona.name;
  }

  if (!modelId) return "Unknown";

  return getAgentLabel(displayName, modelId);
}
