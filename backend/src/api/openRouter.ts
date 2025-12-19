import axios from "axios";
import type { AgentRole } from "../constants/ubiquitousLanguage.js";

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;


const MODEL_MAP: Record<AgentRole, string> = {
  "Research Planner": "openai/gpt-4o-mini",
  "Source Hunter A": "openai/gpt-4o",
  "Source Hunter B": "anthropic/claude-3.5-sonnet",
  "Source Critic": "mistralai/mistral-large",
  Synthesizer: "openai/gpt-4o",
  Skeptic: "google/gemini-pro-1.5",
  Moderator: "anthropic/claude-3.5-sonnet",
  "Final Synthesizer": "openai/gpt-4o",
};

export async function callAgent(
  role: AgentRole,
  messages: OpenRouterMessage[],
  temperature = 0.7
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const model = MODEL_MAP[role];
  if (!model) {
    throw new Error(`No model mapping for role: ${role}`);
  }

  const request: OpenRouterRequest = {
    model,
    messages,
    temperature,
    max_tokens: 2000,
  };

  try {
    const response = await axios.post<OpenRouterResponse>(OPENROUTER_API_URL, request, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Ensemble AI Research System",
      },
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenRouter response");
    }

    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `OpenRouter API error: ${error.response?.status} ${error.response?.statusText}`
      );
    }
    throw error;
  }
}

export { MODEL_MAP };
