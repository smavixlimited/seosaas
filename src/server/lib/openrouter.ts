import {
  createOpenRouter,
  type LanguageModelV3,
} from "@openrouter/ai-sdk-provider";
import {
  getOptionalEnvValue,
} from "@/server/lib/runtime-env";

// OpenRouter model slug used for the in-app chat agents (onboarding + SAM).
// Override with OPENROUTER_MODEL to swap models without a code change.
const DEFAULT_CHAT_AGENT_MODEL = "minimax/minimax-m3";

export interface ResolvedLlmConfig {
  provider: "openrouter" | "openai" | "gemini" | "anthropic";
  apiKey: string;
  modelId: string;
  baseURL?: string;
}

/**
 * Resolves the active LLM configuration by checking configured API keys in priority:
 * 1. OpenRouter (Default / Preferred)
 * 2. OpenAI
 * 3. Google Gemini
 * 4. Anthropic
 */
export async function resolveActiveLlmConfig(): Promise<ResolvedLlmConfig | null> {
  let aiSettings: any = null;
  try {
    const { SystemSettingsService } = await import(
      "@/services/system-settings.service"
    );
    aiSettings = await SystemSettingsService.getAiApis();
  } catch {
    // fallback to env
  }

  // 1. OpenRouter (Default)
  const openrouterKey =
    aiSettings?.openrouterApiKey ||
    (await getOptionalEnvValue("OPENROUTER_API_KEY"));
  if (openrouterKey && openrouterKey.trim().length > 0) {
    const modelId =
      aiSettings?.defaultModel ||
      (await getOptionalEnvValue("OPENROUTER_MODEL")) ||
      DEFAULT_CHAT_AGENT_MODEL;
    return {
      provider: "openrouter",
      apiKey: openrouterKey.trim(),
      modelId,
    };
  }

  // 2. OpenAI
  const openaiKey =
    aiSettings?.openaiApiKey ||
    (await getOptionalEnvValue("OPENAI_API_KEY"));
  if (openaiKey && openaiKey.trim().length > 0) {
    const modelId =
      (aiSettings?.defaultModel &&
      (aiSettings.defaultModel.startsWith("gpt-") ||
        aiSettings.defaultModel.startsWith("o1") ||
        aiSettings.defaultModel.startsWith("o3"))
        ? aiSettings.defaultModel
        : null) ||
      (await getOptionalEnvValue("OPENAI_MODEL")) ||
      "gpt-4o-mini";
    return {
      provider: "openai",
      apiKey: openaiKey.trim(),
      modelId,
      baseURL: "https://api.openai.com/v1",
    };
  }

  // 3. Google Gemini
  const geminiKey =
    aiSettings?.geminiApiKey ||
    (await getOptionalEnvValue("GEMINI_API_KEY")) ||
    (await getOptionalEnvValue("GOOGLE_GENERATIVE_AI_API_KEY"));
  if (geminiKey && geminiKey.trim().length > 0) {
    const modelId =
      (aiSettings?.defaultModel &&
      aiSettings.defaultModel.startsWith("gemini-")
        ? aiSettings.defaultModel
        : null) ||
      (await getOptionalEnvValue("GEMINI_MODEL")) ||
      "gemini-2.0-flash";
    return {
      provider: "gemini",
      apiKey: geminiKey.trim(),
      modelId,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    };
  }

  // 4. Anthropic
  const anthropicKey =
    aiSettings?.anthropicApiKey ||
    (await getOptionalEnvValue("ANTHROPIC_API_KEY"));
  if (anthropicKey && anthropicKey.trim().length > 0) {
    const modelId =
      (aiSettings?.defaultModel &&
      aiSettings.defaultModel.startsWith("claude-")
        ? aiSettings.defaultModel
        : null) ||
      (await getOptionalEnvValue("ANTHROPIC_MODEL")) ||
      "claude-3-5-sonnet";
    return {
      provider: "anthropic",
      apiKey: anthropicKey.trim(),
      modelId,
    };
  }

  return null;
}

/**
 * Returns the AI SDK LanguageModel for chat agents and generative services.
 * Automatically checks OpenRouter, OpenAI, Gemini, Anthropic in priority order.
 */
export async function getChatAgentModel(): Promise<LanguageModelV3> {
  const resolved = await resolveActiveLlmConfig();

  if (!resolved) {
    throw new Error(
      "No active AI provider key configured. Please set an OpenRouter, OpenAI, or Gemini API key in System Settings or environment variables.",
    );
  }

  if (resolved.provider === "openrouter") {
    return buildChatAgentModel(resolved.apiKey, resolved.modelId);
  }

  // OpenAI / Gemini OpenAI-compatible endpoints
  return createOpenRouter({
    apiKey: resolved.apiKey,
    baseURL: resolved.baseURL,
  })(resolved.modelId);
}

/**
 * Synchronous variant for callers that already hold the env values. Think's
 * `getModel()` hook is sync and runs on every turn, so the SAM agent reads the
 * key/model from its DO env and builds the model here.
 */
export function buildChatAgentModel(
  apiKey: string,
  modelId?: string,
): LanguageModelV3 {
  return createOpenRouter({ apiKey })(modelId ?? DEFAULT_CHAT_AGENT_MODEL, {
    usage: { include: true },
    reasoning: { effort: "medium" },
    provider: {
      order: ["together", "atlas-cloud/fp8"],
      zdr: true,
      allow_fallbacks: true,
    },
  });
}

