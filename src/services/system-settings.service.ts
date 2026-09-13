import { BRAND_CONFIG } from "@/config/brand";

export interface BrandingSettings {
  siteTitle: string;
  tagline: string;
  lightLogoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  publicRegistrationEnabled: boolean;
  metaDescription: string;
  metaKeywords: string;
}

export interface SeoApiSettings {
  dataforseoLogin?: string;
  dataforseoPassword?: string;
  dataforseoApiKey?: string;
  indexnowKey?: string;
  firecrawlApiKey?: string;
  firecrawlApiUrl?: string;
}

export interface AiApiSettings {
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  openrouterApiKey?: string;
  defaultModel: string;
}

export interface LocalMapsApiSettings {
  googlePlacesApiKey?: string;
  googleMapsJsApiKey?: string;
}

export interface AnalyticsTrackingSettings {
  ga4MeasurementId?: string;
  googleAnalyticsSnippet?: string;
  gscSiteVerificationTag?: string;
  gscClientId?: string;
  gscClientSecret?: string;
  metaPixelId?: string;
  metaPixelSnippet?: string;
  posthogPublicKey?: string;
  posthogHost?: string;
}

export interface CommunicationsApiSettings {
  resendApiKey?: string;
  senderEmail: string;
  senderName: string;
  loopsApiKey?: string;
  loopsVerifyEmailTemplateId?: string;
  loopsResetPasswordTemplateId?: string;
}

export interface PaymentGatewaysApiSettings {
  paystackEnabled?: boolean;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
  flutterwaveEnabled?: boolean;
  flutterwavePublicKey?: string;
  flutterwaveSecretKey?: string;
  flutterwaveEncryptionKey?: string;
  lemonsqueezyEnabled?: boolean;
  lemonsqueezyApiKey?: string;
  lemonsqueezyStoreId?: string;
  lemonsqueezyWebhookSecret?: string;
  manualPaymentEnabled?: boolean;
  manualPaymentBankName?: string;
  manualPaymentAccountNumber?: string;
  manualPaymentAccountName?: string;
  manualPaymentInstructions?: string;
}

export interface AuthSecurityApiSettings {
  googleClientId?: string;
  googleClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  turnstileSiteKey?: string;
  turnstileSecretKey?: string;
}

const DEFAULT_BRANDING: BrandingSettings = {
  siteTitle: BRAND_CONFIG.name,
  tagline: "Enterprise SEO, AEO Visibility & Content Intelligence SaaS",
  lightLogoUrl: "/logo.png",
  darkLogoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  supportEmail: BRAND_CONFIG.supportEmail,
  publicRegistrationEnabled: true,
  metaDescription: BRAND_CONFIG.description,
  metaKeywords:
    "SEO SaaS, AEO Search Optimization, Keyword Tracking, Backlinks, Rank Tracker, Skorvia",
};

const DEFAULT_SEO_APIS: SeoApiSettings = {
  dataforseoLogin: "",
  dataforseoPassword: "",
  dataforseoApiKey: "",
  indexnowKey: "skorvia_indexnow_verify_key_2026",
  firecrawlApiKey: "",
  firecrawlApiUrl: "https://api.firecrawl.dev",
};

const DEFAULT_AI_APIS: AiApiSettings = {
  geminiApiKey: "",
  openaiApiKey: "",
  anthropicApiKey: "",
  openrouterApiKey: "",
  defaultModel: "anthropic/claude-3.5-sonnet",
};

const DEFAULT_LOCAL_APIS: LocalMapsApiSettings = {
  googlePlacesApiKey: "",
  googleMapsJsApiKey: "",
};

const DEFAULT_ANALYTICS_APIS: AnalyticsTrackingSettings = {
  ga4MeasurementId: "",
  googleAnalyticsSnippet: "",
  gscSiteVerificationTag: "",
  gscClientId: "",
  gscClientSecret: "",
  metaPixelId: "",
  metaPixelSnippet: "",
  posthogPublicKey: "",
  posthogHost: "https://us.i.posthog.com",
};

const DEFAULT_COMMS_APIS: CommunicationsApiSettings = {
  resendApiKey: "",
  senderEmail: "notifications@skorvia.com",
  senderName: "Skorvia",
  loopsApiKey: "",
  loopsVerifyEmailTemplateId: "",
  loopsResetPasswordTemplateId: "",
};

const DEFAULT_PAYMENTS_APIS: PaymentGatewaysApiSettings = {
  paystackEnabled: true,
  paystackPublicKey: "",
  paystackSecretKey: "",
  flutterwaveEnabled: true,
  flutterwavePublicKey: "",
  flutterwaveSecretKey: "",
  flutterwaveEncryptionKey: "",
  lemonsqueezyEnabled: true,
  lemonsqueezyApiKey: "",
  lemonsqueezyStoreId: "",
  lemonsqueezyWebhookSecret: "",
  manualPaymentEnabled: true,
  manualPaymentBankName: "Skorvia Enterprise Bank",
  manualPaymentAccountNumber: "0123456789",
  manualPaymentAccountName: "Skorvia Technologies Ltd",
  manualPaymentInstructions:
    "Please transfer the exact plan amount and upload the payment receipt.",
};

const DEFAULT_AUTH_SECURITY_APIS: AuthSecurityApiSettings = {
  googleClientId: "",
  googleClientSecret: "",
  githubClientId: "",
  githubClientSecret: "",
  turnstileSiteKey: "",
  turnstileSecretKey: "",
};

// In-Memory Fast Cache
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 1 minute

export const SystemSettingsService = {
  /**
   * Reads a setting from memory cache or database with fallback to default.
   */
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    try {
      const { db } = await import("@/db");
      const { systemSettings } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);

      if (row && row.valueJson) {
        const parsed = JSON.parse(row.valueJson) as T;
        memoryCache.set(key, {
          value: parsed,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return { ...defaultValue, ...parsed };
      }
    } catch {
      // Fallback on dev/test environment or before tables migrate
    }

    memoryCache.set(key, {
      value: defaultValue,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return defaultValue;
  },

  /**
   * Persists a setting in the database and refreshes memory cache.
   */
  async setSetting<T>(key: string, value: T, updatedBy?: string): Promise<T> {
    const jsonStr = JSON.stringify(value);
    const now = new Date().toISOString();

    try {
      const { db } = await import("@/db");
      const { systemSettings } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);

      if (existing) {
        await db
          .update(systemSettings)
          .set({
            valueJson: jsonStr,
            updatedAt: now,
            updatedBy: updatedBy || null,
          })
          .where(eq(systemSettings.key, key));
      } else {
        await db.insert(systemSettings).values({
          key,
          valueJson: jsonStr,
          updatedAt: now,
          updatedBy: updatedBy || null,
        });
      }
    } catch (err) {
      console.warn(`Failed to persist system setting '${key}' to DB:`, err);
    }

    memoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  },

  /**
   * Clears the cache for a specific key or all keys.
   */
  clearCache(key?: string) {
    if (key) {
      memoryCache.delete(key);
    } else {
      memoryCache.clear();
    }
  },

  // ---------------------------------------------------------------------------
  // Convenience Methods
  // ---------------------------------------------------------------------------

  async getBranding(): Promise<BrandingSettings> {
    return this.getSetting<BrandingSettings>("branding", DEFAULT_BRANDING);
  },

  async setBranding(
    settings: Partial<BrandingSettings>,
    updatedBy?: string,
  ): Promise<BrandingSettings> {
    const current = await this.getBranding();
    const updated = { ...current, ...settings };
    return this.setSetting<BrandingSettings>("branding", updated, updatedBy);
  },

  async isPublicRegistrationEnabled(): Promise<boolean> {
    const branding = await this.getBranding();
    return branding?.publicRegistrationEnabled !== false;
  },

  async getSeoApis(): Promise<SeoApiSettings> {
    return this.getSetting<SeoApiSettings>("api_seo", DEFAULT_SEO_APIS);
  },

  async setSeoApis(
    settings: Partial<SeoApiSettings>,
    updatedBy?: string,
  ): Promise<SeoApiSettings> {
    const current = await this.getSeoApis();
    const updated = { ...current, ...settings };
    return this.setSetting<SeoApiSettings>("api_seo", updated, updatedBy);
  },

  async getAiApis(): Promise<AiApiSettings> {
    return this.getSetting<AiApiSettings>("api_ai", DEFAULT_AI_APIS);
  },

  /**
   * Synchronously retrieves memory-cached AI APIs.
   */
  getAiApisSync(): AiApiSettings {
    const cached = memoryCache.get("api_ai");
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as AiApiSettings;
    }
    return DEFAULT_AI_APIS;
  },

  async setAiApis(
    settings: Partial<AiApiSettings>,
    updatedBy?: string,
  ): Promise<AiApiSettings> {
    const current = await this.getAiApis();
    const updated = { ...current, ...settings };
    return this.setSetting<AiApiSettings>("api_ai", updated, updatedBy);
  },

  async getLocalMapsApis(): Promise<LocalMapsApiSettings> {
    return this.getSetting<LocalMapsApiSettings>(
      "api_local",
      DEFAULT_LOCAL_APIS,
    );
  },

  async setLocalMapsApis(
    settings: Partial<LocalMapsApiSettings>,
    updatedBy?: string,
  ): Promise<LocalMapsApiSettings> {
    const current = await this.getLocalMapsApis();
    const updated = { ...current, ...settings };
    return this.setSetting<LocalMapsApiSettings>(
      "api_local",
      updated,
      updatedBy,
    );
  },

  async getAnalyticsApis(): Promise<AnalyticsTrackingSettings> {
    return this.getSetting<AnalyticsTrackingSettings>(
      "api_analytics",
      DEFAULT_ANALYTICS_APIS,
    );
  },

  async setAnalyticsApis(
    settings: Partial<AnalyticsTrackingSettings>,
    updatedBy?: string,
  ): Promise<AnalyticsTrackingSettings> {
    const current = await this.getAnalyticsApis();
    const updated = { ...current, ...settings };
    return this.setSetting<AnalyticsTrackingSettings>(
      "api_analytics",
      updated,
      updatedBy,
    );
  },

  async getCommunicationsApis(): Promise<CommunicationsApiSettings> {
    return this.getSetting<CommunicationsApiSettings>(
      "api_communications",
      DEFAULT_COMMS_APIS,
    );
  },

  async setCommunicationsApis(
    settings: Partial<CommunicationsApiSettings>,
    updatedBy?: string,
  ): Promise<CommunicationsApiSettings> {
    const current = await this.getCommunicationsApis();
    const updated = { ...current, ...settings };
    return this.setSetting<CommunicationsApiSettings>(
      "api_communications",
      updated,
      updatedBy,
    );
  },

  async getPaymentGatewaysApis(): Promise<PaymentGatewaysApiSettings> {
    return this.getSetting<PaymentGatewaysApiSettings>(
      "api_payments",
      DEFAULT_PAYMENTS_APIS,
    );
  },

  async setPaymentGatewaysApis(
    settings: Partial<PaymentGatewaysApiSettings>,
    updatedBy?: string,
  ): Promise<PaymentGatewaysApiSettings> {
    const current = await this.getPaymentGatewaysApis();
    const updated = { ...current, ...settings };
    return this.setSetting<PaymentGatewaysApiSettings>(
      "api_payments",
      updated,
      updatedBy,
    );
  },

  async getAuthSecurityApis(): Promise<AuthSecurityApiSettings> {
    return this.getSetting<AuthSecurityApiSettings>(
      "api_auth_security",
      DEFAULT_AUTH_SECURITY_APIS,
    );
  },

  async setAuthSecurityApis(
    settings: Partial<AuthSecurityApiSettings>,
    updatedBy?: string,
  ): Promise<AuthSecurityApiSettings> {
    const current = await this.getAuthSecurityApis();
    const updated = { ...current, ...settings };
    return this.setSetting<AuthSecurityApiSettings>(
      "api_auth_security",
      updated,
      updatedBy,
    );
  },
};
