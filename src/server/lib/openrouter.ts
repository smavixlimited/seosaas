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

  // 1. Explicitly configured keys from Admin / SystemSettings (Highest Priority)
  if (aiSettings?.openaiApiKey && aiSettings.openaiApiKey.trim().length > 0) {
    const modelId =
      (aiSettings.defaultModel &&
      (aiSettings.defaultModel.startsWith("gpt-") ||
        aiSettings.defaultModel.startsWith("o1") ||
        aiSettings.defaultModel.startsWith("o3")))
        ? aiSettings.defaultModel
        : "gpt-4o-mini";
    return {
      provider: "openai",
      apiKey: aiSettings.openaiApiKey.trim(),
      modelId,
      baseURL: "https://api.openai.com/v1",
    };
  }

  if (aiSettings?.openrouterApiKey && aiSettings.openrouterApiKey.trim().length > 0) {
    const modelId = aiSettings.defaultModel || DEFAULT_CHAT_AGENT_MODEL;
    return {
      provider: "openrouter",
      apiKey: aiSettings.openrouterApiKey.trim(),
      modelId,
    };
  }

  if (aiSettings?.geminiApiKey && aiSettings.geminiApiKey.trim().length > 0) {
    const modelId =
      (aiSettings.defaultModel && aiSettings.defaultModel.startsWith("gemini-"))
        ? aiSettings.defaultModel
        : "gemini-2.0-flash";
    return {
      provider: "gemini",
      apiKey: aiSettings.geminiApiKey.trim(),
      modelId,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    };
  }

  if (aiSettings?.anthropicApiKey && aiSettings.anthropicApiKey.trim().length > 0) {
    const modelId =
      (aiSettings.defaultModel && aiSettings.defaultModel.startsWith("claude-"))
        ? aiSettings.defaultModel
        : "claude-3-5-sonnet";
    return {
      provider: "anthropic",
      apiKey: aiSettings.anthropicApiKey.trim(),
      modelId,
    };
  }

  // 2. Fallbacks from Environment Variables
  const openaiEnv = await getOptionalEnvValue("OPENAI_API_KEY");
  if (openaiEnv && openaiEnv.trim().length > 0) {
    const modelId = (await getOptionalEnvValue("OPENAI_MODEL")) || "gpt-4o-mini";
    return {
      provider: "openai",
      apiKey: openaiEnv.trim(),
      modelId,
      baseURL: "https://api.openai.com/v1",
    };
  }

  const openrouterEnv = await getOptionalEnvValue("OPENROUTER_API_KEY");
  if (openrouterEnv && openrouterEnv.trim().length > 0 && !openrouterEnv.includes("placeholder")) {
    const modelId =
      (await getOptionalEnvValue("OPENROUTER_MODEL")) || DEFAULT_CHAT_AGENT_MODEL;
    return {
      provider: "openrouter",
      apiKey: openrouterEnv.trim(),
      modelId,
    };
  }

  const geminiEnv =
    (await getOptionalEnvValue("GEMINI_API_KEY")) ||
    (await getOptionalEnvValue("GOOGLE_GENERATIVE_AI_API_KEY"));
  if (geminiEnv && geminiEnv.trim().length > 0) {
    const modelId = (await getOptionalEnvValue("GEMINI_MODEL")) || "gemini-2.0-flash";
    return {
      provider: "gemini",
      apiKey: geminiEnv.trim(),
      modelId,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    };
  }

  const anthropicEnv = await getOptionalEnvValue("ANTHROPIC_API_KEY");
  if (anthropicEnv && anthropicEnv.trim().length > 0) {
    const modelId = (await getOptionalEnvValue("ANTHROPIC_MODEL")) || "claude-3-5-sonnet";
    return {
      provider: "anthropic",
      apiKey: anthropicEnv.trim(),
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

  return buildChatAgentModel(resolved.apiKey, resolved.modelId, resolved.baseURL);
}

/**
 * Synchronous variant for callers that already hold the env values. Think's
 * `getModel()` hook is sync and runs on every turn, so the SAM agent reads the
 * key/model from its DO env and builds the model here.
 */
export function buildChatAgentModel(
  apiKey: string,
  modelId?: string,
  baseURL?: string,
): LanguageModelV3 {
  const isDirectOpenAi = Boolean(baseURL && baseURL.includes("api.openai.com"));
  const isDirectGemini = Boolean(baseURL && baseURL.includes("googleapis.com"));

  if (isDirectOpenAi || isDirectGemini) {
    return createOpenRouter({
      apiKey,
      baseURL,
      headers: {},
    })(modelId ?? (isDirectGemini ? "gemini-2.0-flash" : "gpt-4o-mini"));
  }

  return createOpenRouter({ apiKey, baseURL })(modelId ?? DEFAULT_CHAT_AGENT_MODEL, {
    usage: { include: true },
    reasoning: { effort: "medium" },
    provider: {
      order: ["together", "atlas-cloud/fp8"],
      zdr: true,
      allow_fallbacks: true,
    },
  });
}


