import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getSeoApiKeyStatus = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(async () => {
    let configured = Boolean(env.DATAFORSEO_API_KEY?.trim());
    if (!configured) {
      try {
        const { SystemSettingsService } =
          await import("@/services/system-settings.service");
        const seoSettings = await SystemSettingsService.getSetting<{
          dataforseoApiKey?: string;
          dataforseoLogin?: string;
          dataforseoPassword?: string;
        }>("seo_apis", {});
        if (
          seoSettings.dataforseoApiKey ||
          (seoSettings.dataforseoLogin && seoSettings.dataforseoPassword)
        ) {
          configured = true;
        }
      } catch {}
    }
    return { configured };
  });
