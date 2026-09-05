import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import {
  SystemSettingsService,
  type BrandingSettings,
  type SeoApiSettings,
  type AiApiSettings,
  type LocalMapsApiSettings,
  type AnalyticsTrackingSettings,
  type CommunicationsApiSettings,
  type PaymentGatewaysApiSettings,
  type AuthSecurityApiSettings,
} from "@/services/system-settings.service";

// Public Branding Schema
const brandingUpdateSchema = z.object({
  siteTitle: z.string().optional(),
  tagline: z.string().optional(),
  lightLogoUrl: z.string().optional(),
  darkLogoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  supportEmail: z.string().optional(),
  publicRegistrationEnabled: z.boolean().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

// Categorized API Settings Update Schema
const updateApiSettingsSchema = z.object({
  category: z.enum([
    "seo",
    "ai",
    "local",
    "analytics",
    "communications",
    "payments",
    "auth",
  ]),
  seo: z
    .object({
      dataforseoLogin: z.string().optional(),
      dataforseoPassword: z.string().optional(),
      dataforseoApiKey: z.string().optional(),
      indexnowKey: z.string().optional(),
      firecrawlApiKey: z.string().optional(),
      firecrawlApiUrl: z.string().optional(),
    })
    .optional(),
  ai: z
    .object({
      geminiApiKey: z.string().optional(),
      openaiApiKey: z.string().optional(),
      anthropicApiKey: z.string().optional(),
      openrouterApiKey: z.string().optional(),
      defaultModel: z.string().optional(),
    })
    .optional(),
  local: z
    .object({
      googlePlacesApiKey: z.string().optional(),
      googleMapsJsApiKey: z.string().optional(),
    })
    .optional(),
  analytics: z
    .object({
      ga4MeasurementId: z.string().optional(),
      googleAnalyticsSnippet: z.string().optional(),
      gscSiteVerificationTag: z.string().optional(),
      gscClientId: z.string().optional(),
      gscClientSecret: z.string().optional(),
      metaPixelId: z.string().optional(),
      metaPixelSnippet: z.string().optional(),
      posthogPublicKey: z.string().optional(),
      posthogHost: z.string().optional(),
    })
    .optional(),
  communications: z
    .object({
      resendApiKey: z.string().optional(),
      senderEmail: z.string().optional(),
      senderName: z.string().optional(),
      loopsApiKey: z.string().optional(),
      loopsVerifyEmailTemplateId: z.string().optional(),
      loopsResetPasswordTemplateId: z.string().optional(),
    })
    .optional(),
  payments: z
    .object({
      paystackEnabled: z.boolean().optional(),
      paystackPublicKey: z.string().optional(),
      paystackSecretKey: z.string().optional(),
      flutterwaveEnabled: z.boolean().optional(),
      flutterwavePublicKey: z.string().optional(),
      flutterwaveSecretKey: z.string().optional(),
      flutterwaveEncryptionKey: z.string().optional(),
      lemonsqueezyEnabled: z.boolean().optional(),
      lemonsqueezyApiKey: z.string().optional(),
      lemonsqueezyStoreId: z.string().optional(),
      lemonsqueezyWebhookSecret: z.string().optional(),
      manualPaymentEnabled: z.boolean().optional(),
      manualPaymentBankName: z.string().optional(),
      manualPaymentAccountNumber: z.string().optional(),
      manualPaymentAccountName: z.string().optional(),
      manualPaymentInstructions: z.string().optional(),
    })
    .optional(),
  auth: z
    .object({
      googleClientId: z.string().optional(),
      googleClientSecret: z.string().optional(),
      githubClientId: z.string().optional(),
      githubClientSecret: z.string().optional(),
      turnstileSiteKey: z.string().optional(),
      turnstileSecretKey: z.string().optional(),
    })
    .optional(),
});

/**
 * Public server function to read active branding & registration status.
 */
export const getPublicBranding = createServerFn({ method: "GET" }).handler(
  async () => {
    return SystemSettingsService.getBranding();
  },
);

/**
 * Public server function to check if new user registration is open.
 */
export const getRegistrationStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      enabled: await SystemSettingsService.isPublicRegistrationEnabled(),
    };
  },
);

/**
 * Public server function to read public tracking IDs (GA4, GSC, Meta Pixel).
 */
export const getPublicTrackingCodes = createServerFn({ method: "GET" }).handler(
  async () => {
    const analytics = await SystemSettingsService.getAnalyticsApis();
    return {
      ga4MeasurementId:
        analytics.ga4MeasurementId || process.env.VITE_GA4_MEASUREMENT_ID || "",
      googleAnalyticsSnippet: analytics.googleAnalyticsSnippet || "",
      gscSiteVerificationTag:
        analytics.gscSiteVerificationTag ||
        process.env.VITE_GSC_VERIFICATION_TAG ||
        "",
      metaPixelId:
        analytics.metaPixelId || process.env.VITE_META_PIXEL_ID || "",
      metaPixelSnippet: analytics.metaPixelSnippet || "",
    };
  },
);

/**
 * Superadmin server function to retrieve branding settings.
 */
export const getAdminBranding = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async () => {
    return SystemSettingsService.getBranding();
  });

/**
 * Superadmin server function to update site branding.
 */
export const updateAdminBranding = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(brandingUpdateSchema)
  .handler(async ({ data, context }) => {
    return SystemSettingsService.setBranding(
      data as Partial<BrandingSettings>,
      context.userId,
    );
  });

/**
 * Superadmin server function to retrieve all categorized API settings.
 */
export const getAdminApiSettings = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async () => {
    const [seo, ai, local, analytics, communications, payments, auth] =
      await Promise.all([
        SystemSettingsService.getSeoApis(),
        SystemSettingsService.getAiApis(),
        SystemSettingsService.getLocalMapsApis(),
        SystemSettingsService.getAnalyticsApis(),
        SystemSettingsService.getCommunicationsApis(),
        SystemSettingsService.getPaymentGatewaysApis(),
        SystemSettingsService.getAuthSecurityApis(),
      ]);

    return { seo, ai, local, analytics, communications, payments, auth };
  });

/**
 * Superadmin server function to update categorized API credentials.
 */
export const updateAdminApiSettings = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(updateApiSettingsSchema)
  .handler(async ({ data, context }) => {
    const { category } = data;
    if (category === "seo" && data.seo) {
      return SystemSettingsService.setSeoApis(
        data.seo as Partial<SeoApiSettings>,
        context.userId,
      );
    }
    if (category === "ai" && data.ai) {
      return SystemSettingsService.setAiApis(
        data.ai as Partial<AiApiSettings>,
        context.userId,
      );
    }
    if (category === "local" && data.local) {
      return SystemSettingsService.setLocalMapsApis(
        data.local as Partial<LocalMapsApiSettings>,
        context.userId,
      );
    }
    if (category === "analytics" && data.analytics) {
      return SystemSettingsService.setAnalyticsApis(
        data.analytics as Partial<AnalyticsTrackingSettings>,
        context.userId,
      );
    }
    if (category === "communications" && data.communications) {
      return SystemSettingsService.setCommunicationsApis(
        data.communications as Partial<CommunicationsApiSettings>,
        context.userId,
      );
    }
    if (category === "payments" && data.payments) {
      return SystemSettingsService.setPaymentGatewaysApis(
        data.payments as Partial<PaymentGatewaysApiSettings>,
        context.userId,
      );
    }
    if (category === "auth" && data.auth) {
      return SystemSettingsService.setAuthSecurityApis(
        data.auth as Partial<AuthSecurityApiSettings>,
        context.userId,
      );
    }
    return { success: true };
  });
