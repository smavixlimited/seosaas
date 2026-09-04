import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { getAdminApiSettings, updateAdminApiSettings } from "@/serverFunctions/system-settings";
import { DnsDomainValidator } from "@/client/components/admin/DnsDomainValidator";
import type {
  SeoApiSettings,
  AiApiSettings,
  LocalMapsApiSettings,
  AnalyticsTrackingSettings,
  CommunicationsApiSettings,
  PaymentGatewaysApiSettings,
  AuthSecurityApiSettings,
} from "@/services/system-settings.service";

export const Route = createFileRoute("/_admin/admin/settings/apis")({
  component: AdminApiManagerPage,
});

type ApiCategory = "seo" | "ai" | "local" | "analytics" | "communications" | "payments" | "auth";

function AdminApiManagerPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = React.useState<ApiCategory>("seo");
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const apiSettingsQuery = useQuery({
    queryKey: ["adminApiSettings"],
    queryFn: () => getAdminApiSettings(),
  });

  const [seo, setSeo] = React.useState<SeoApiSettings>({
    dataforseoLogin: "",
    dataforseoPassword: "",
    dataforseoApiKey: "",
    indexnowKey: "skorvia_indexnow_verify_key_2026",
    firecrawlApiKey: "",
    firecrawlApiUrl: "https://api.firecrawl.dev",
  });

  const [ai, setAi] = React.useState<AiApiSettings>({
    geminiApiKey: "",
    openaiApiKey: "",
    anthropicApiKey: "",
    openrouterApiKey: "",
    defaultModel: "anthropic/claude-3.5-sonnet",
  });

  const [local, setLocal] = React.useState<LocalMapsApiSettings>({
    googlePlacesApiKey: "",
    googleMapsJsApiKey: "",
  });

  const [analytics, setAnalytics] = React.useState<AnalyticsTrackingSettings>({
    ga4MeasurementId: "",
    googleAnalyticsSnippet: "",
    gscSiteVerificationTag: "",
    gscClientId: "",
    gscClientSecret: "",
    metaPixelId: "",
    metaPixelSnippet: "",
    posthogPublicKey: "",
    posthogHost: "https://us.i.posthog.com",
  });

  const [comms, setComms] = React.useState<CommunicationsApiSettings>({
    resendApiKey: "",
    senderEmail: "notifications@skorvia.com",
    senderName: "Skorvia",
    loopsApiKey: "",
    loopsVerifyEmailTemplateId: "",
    loopsResetPasswordTemplateId: "",
  });

  const [payments, setPayments] = React.useState<PaymentGatewaysApiSettings>({
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
    manualPaymentInstructions: "Please transfer the exact amount and upload your payment receipt.",
  });

  const [auth, setAuth] = React.useState<AuthSecurityApiSettings>({
    googleClientId: "",
    googleClientSecret: "",
    githubClientId: "",
    githubClientSecret: "",
    turnstileSiteKey: "",
    turnstileSecretKey: "",
  });

  React.useEffect(() => {
    if (apiSettingsQuery.data) {
      if (apiSettingsQuery.data.seo) setSeo(apiSettingsQuery.data.seo);
      if (apiSettingsQuery.data.ai) setAi(apiSettingsQuery.data.ai);
      if (apiSettingsQuery.data.local) setLocal(apiSettingsQuery.data.local);
      if (apiSettingsQuery.data.analytics) setAnalytics(apiSettingsQuery.data.analytics);
      if (apiSettingsQuery.data.communications) setComms(apiSettingsQuery.data.communications);
      if (apiSettingsQuery.data.payments) setPayments(apiSettingsQuery.data.payments);
      if (apiSettingsQuery.data.auth) setAuth(apiSettingsQuery.data.auth);
    }
  }, [apiSettingsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateAdminApiSettings>[0]["data"]) =>
      updateAdminApiSettings({ data }),
    onSuccess: (_, variables) => {
      toast.success(`${variables.category.toUpperCase()} settings saved successfully!`);
      void queryClient.invalidateQueries({ queryKey: ["adminApiSettings"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update API settings");
    },
  });

  const handleSaveCategory = (category: ApiCategory) => {
    if (category === "seo") updateMutation.mutate({ category, seo });
    if (category === "ai") updateMutation.mutate({ category, ai });
    if (category === "local") updateMutation.mutate({ category, local });
    if (category === "analytics") updateMutation.mutate({ category, analytics });
    if (category === "communications") updateMutation.mutate({ category, communications: comms });
    if (category === "payments") updateMutation.mutate({ category, payments });
    if (category === "auth") updateMutation.mutate({ category, auth });
  };

  const isPending = updateMutation.isPending;

  return (
    <div className="w-full space-y-6">
      {/* Venix Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Smart API Key &amp; Integrations Manager
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centralized credential vault for DataForSEO, Google Search Console, GA4, Meta Pixel, AI LLMs, Resend, Gateways, and OAuth.
          </p>
        </div>
      </div>

      {/* Categorized Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setActiveCategory("seo")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "seo"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:magnifer-bold-duotone" className="h-4 w-4" />
          <span>SEO &amp; Crawlers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("analytics")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "analytics"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:chart-square-bold-duotone" className="h-4 w-4" />
          <span>Analytics &amp; Tracking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("ai")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "ai"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:cpu-bolt-bold-duotone" className="h-4 w-4" />
          <span>AI &amp; LLMs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("local")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "local"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:map-point-bold-duotone" className="h-4 w-4" />
          <span>Google Maps &amp; GBP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("communications")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "communications"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:letter-bold-duotone" className="h-4 w-4" />
          <span>Email &amp; Comms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("payments")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "payments"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:card-2-bold-duotone" className="h-4 w-4" />
          <span>Payment Gateways</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("auth")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeCategory === "auth"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Icon icon="solar:shield-keyhole-bold-duotone" className="h-4 w-4" />
          <span>OAuth &amp; Turnstile</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 1. SEO & Crawlers Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "seo" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Icon icon="solar:magnifer-bold-duotone" className="h-4 w-4 text-primary" />
                  <span>DataForSEO &amp; IndexNow Configuration</span>
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">Powers keyword tracking, backlink audits, and instant URL push.</p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveCategory("seo")}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
              >
                {isPending ? "Saving..." : "Save SEO Keys"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">DataForSEO API Login (Email)</label>
                <input
                  type="text"
                  value={seo.dataforseoLogin || ""}
                  onChange={(e) => setSeo({ ...seo, dataforseoLogin: e.target.value })}
                  placeholder="account@domain.com"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">DataForSEO API Password / Token</label>
                <div className="relative flex items-center">
                  <input
                    type={showSecrets.dfsPass ? "text" : "password"}
                    value={seo.dataforseoPassword || ""}
                    onChange={(e) => setSeo({ ...seo, dataforseoPassword: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-3 pr-9 text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("dfsPass")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600"
                  >
                    <Icon icon={showSecrets.dfsPass ? "solar:eye-closed-bold" : "solar:eye-bold"} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">IndexNow Master Verification Key</label>
                <input
                  type="text"
                  value={seo.indexnowKey || ""}
                  onChange={(e) => setSeo({ ...seo, indexnowKey: e.target.value })}
                  placeholder="skorvia_indexnow_verify_key_2026"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Firecrawl Crawler Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                <Icon icon="solar:fire-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Firecrawl Web Crawler &amp; LLM Scraper</h6>
                <p className="text-[11px] text-slate-400">8-in-1 AI Ingestion Studio for turning entire sites into clean Markdown.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Firecrawl API Key</label>
                <input
                  type="password"
                  value={seo.firecrawlApiKey || ""}
                  onChange={(e) => setSeo({ ...seo, firecrawlApiKey: e.target.value })}
                  placeholder="fc-••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Firecrawl API Endpoint</label>
                <input
                  type="text"
                  value={seo.firecrawlApiUrl || "https://api.firecrawl.dev"}
                  onChange={(e) => setSeo({ ...seo, firecrawlApiUrl: e.target.value })}
                  placeholder="https://api.firecrawl.dev"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 2. Analytics & Tracking Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "analytics" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon icon="solar:chart-square-bold-duotone" className="h-5 w-5 text-primary" />
                <span>Web Traffic, Conversion Pixels &amp; Analytics</span>
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure Google Search Console, Google Analytics 4, Meta (Facebook) Pixel, and PostHog.
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveCategory("analytics")}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
            >
              {isPending ? "Saving..." : "Save Analytics Keys"}
            </button>
          </div>

          {/* Google Search Console */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Icon icon="solar:magnifer-zoom-in-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Google Search Console (GSC) Traffic Monitor</h6>
                <p className="text-[11px] text-slate-400">Monitor website indexing, organic search impressions, and click-through rates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 md:col-span-3">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Site Verification Meta Tag / Token (HTML Header)
                </label>
                <input
                  type="text"
                  value={analytics.gscSiteVerificationTag || ""}
                  onChange={(e) => setAnalytics({ ...analytics, gscSiteVerificationTag: e.target.value })}
                  placeholder='e.g. google-site-verification=abc123xyz or <meta name="google-site-verification" content="..." />'
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Automatically injected into the site &lt;head&gt; for 1-click domain ownership verification.</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">GSC OAuth Client ID</label>
                <input
                  type="text"
                  value={analytics.gscClientId || ""}
                  onChange={(e) => setAnalytics({ ...analytics, gscClientId: e.target.value })}
                  placeholder="••••••••.apps.googleusercontent.com"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">GSC OAuth Client Secret</label>
                <input
                  type="password"
                  value={analytics.gscClientSecret || ""}
                  onChange={(e) => setAnalytics({ ...analytics, gscClientSecret: e.target.value })}
                  placeholder="GOCSPX-••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Google Analytics GA4 */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Icon icon="solar:graph-up-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Google Analytics 4 (GA4)</h6>
                <p className="text-[11px] text-slate-400">Track user acquisition, landing page performance, and session durations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">GA4 Measurement ID</label>
                <input
                  type="text"
                  value={analytics.ga4MeasurementId || ""}
                  onChange={(e) => setAnalytics({ ...analytics, ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Enter your Measurement ID to activate Google tag (gtag.js) across all pages automatically.</span>
              </div>
            </div>
          </div>

          {/* Meta Pixel */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Icon icon="solar:target-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Meta (Facebook) Pixel &amp; Ad Conversions</h6>
                <p className="text-[11px] text-slate-400">Track paid ad conversions, retarget visitors, and optimize Meta ad campaigns.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Meta Pixel Dataset ID</label>
                <input
                  type="text"
                  value={analytics.metaPixelId || ""}
                  onChange={(e) => setAnalytics({ ...analytics, metaPixelId: e.target.value })}
                  placeholder="123456789012345"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Enables automated PageView and event tracking for Facebook and Instagram campaigns.</span>
              </div>
            </div>
          </div>

          {/* PostHog Product Telemetry */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                <Icon icon="solar:activity-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">PostHog Product Analytics &amp; Session Replay</h6>
                <p className="text-[11px] text-slate-400">Feature flags, funnels, user retention, and error recordings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">PostHog Public API Key</label>
                <input
                  type="text"
                  value={analytics.posthogPublicKey || ""}
                  onChange={(e) => setAnalytics({ ...analytics, posthogPublicKey: e.target.value })}
                  placeholder="phc_••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">PostHog Host Ingestion URL</label>
                <input
                  type="text"
                  value={analytics.posthogHost || "https://us.i.posthog.com"}
                  onChange={(e) => setAnalytics({ ...analytics, posthogHost: e.target.value })}
                  placeholder="https://us.i.posthog.com"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 3. AI & LLM Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "ai" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon icon="solar:cpu-bolt-bold-duotone" className="h-4 w-4 text-primary" />
                <span>AI Models &amp; Inference Vault</span>
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure LLM providers for Skorvia AI Copilot, content generation, and AEO scans.</p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveCategory("ai")}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
            >
              {isPending ? "Saving..." : "Save AI Keys"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Icon icon="solar:magic-stick-3-bold-duotone" className="h-4 w-4 text-primary" />
                    <span>Primary Active AI Model (OpenRouter / Inference Engine)</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Select the workhorse LLM used for SAM Copilot, Competitor Strategy Decoder, and on-demand SEO fixes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Quick Model Presets</span>
                  <select
                    value={
                      [
                        "anthropic/claude-3.5-sonnet",
                        "anthropic/claude-3.7-sonnet",
                        "openai/gpt-4o",
                        "openai/gpt-4o-mini",
                        "mistralai/mistral-large-2411",
                        "mistralai/codestral-2501",
                        "minimax/minimax-m3",
                        "deepseek/deepseek-chat",
                        "google/gemini-2.0-flash-001",
                      ].includes(ai.defaultModel || "")
                        ? ai.defaultModel
                        : "custom"
                    }
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        setAi({ ...ai, defaultModel: e.target.value });
                      }
                    }}
                    className="h-9 w-full rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                  >
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended - Best for SEO Reasoning)</option>
                    <option value="anthropic/claude-3.7-sonnet">Claude 3.7 Sonnet (Latest Hybrid Reasoning)</option>
                    <option value="openai/gpt-4o">OpenAI GPT-4o (Omnimodel)</option>
                    <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (Ultra Fast &amp; Affordable)</option>
                    <option value="mistralai/mistral-large-2411">Mistral Large 2411 (Mistral Flagship)</option>
                    <option value="mistralai/codestral-2501">Mistral Codestral 2501 (Best for Schema &amp; Code)</option>
                    <option value="deepseek/deepseek-chat">DeepSeek V3 (DeepSeek Chat)</option>
                    <option value="minimax/minimax-m3">MiniMax M3 (High Speed Reasoning)</option>
                    <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash</option>
                    <option value="custom">Custom Model Identifier...</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Exact Model Slug / Custom ID</span>
                  <input
                    type="text"
                    value={ai.defaultModel || "anthropic/claude-3.5-sonnet"}
                    onChange={(e) => setAi({ ...ai, defaultModel: e.target.value })}
                    placeholder="e.g. mistralai/mistral-large-2411 or anthropic/claude-3.5-sonnet"
                    className="h-9 w-full rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Google Gemini API Key</label>
              <input
                type="password"
                value={ai.geminiApiKey || ""}
                onChange={(e) => setAi({ ...ai, geminiApiKey: e.target.value })}
                placeholder="AIzaSy••••••••"
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">OpenAI API Key</label>
              <input
                type="password"
                value={ai.openaiApiKey || ""}
                onChange={(e) => setAi({ ...ai, openaiApiKey: e.target.value })}
                placeholder="sk-proj-••••••••"
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Anthropic Claude API Key</label>
              <input
                type="password"
                value={ai.anthropicApiKey || ""}
                onChange={(e) => setAi({ ...ai, anthropicApiKey: e.target.value })}
                placeholder="sk-ant-••••••••"
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">OpenRouter API Key</label>
              <input
                type="password"
                value={ai.openrouterApiKey || ""}
                onChange={(e) => setAi({ ...ai, openrouterApiKey: e.target.value })}
                placeholder="sk-or-v1-••••••••"
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 4. Google Maps & GBP Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "local" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon icon="solar:map-point-bold-duotone" className="h-4 w-4 text-primary" />
                <span>Google Places &amp; Maps JavaScript API Credentials</span>
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powers Google Business Profile synchronization, local review scraping, and Geo-Grid Map Rank tracker.</p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveCategory("local")}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
            >
              {isPending ? "Saving..." : "Save Maps Keys"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Google Places API Key (Server)</label>
              <input
                type="password"
                value={local.googlePlacesApiKey || ""}
                onChange={(e) => setLocal({ ...local, googlePlacesApiKey: e.target.value })}
                placeholder="AIzaSy••••••••"
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Used for GBP business lookup, photos, reviews &amp; citations.</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Google Maps JavaScript API Key (Client)</label>
              <input
                type="password"
                value={local.googleMapsJsApiKey || ""}
                onChange={(e) => setLocal({ ...local, googleMapsJsApiKey: e.target.value })}
                placeholder="AIzaSy••••••••"
                className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Used for interactive map rendering in Geo-Grid Rank Tracker.</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 5. Communications Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "communications" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Icon icon="solar:letter-bold-duotone" className="h-4 w-4 text-primary" />
                  <span>Resend Email API &amp; Sender Signature</span>
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">Transactional emails, Monday SEO digests, password resets, and invite dispatches.</p>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSaveCategory("communications")}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
              >
                {isPending ? "Saving..." : "Save Email Settings"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Resend API Key</label>
                <input
                  type="password"
                  value={comms.resendApiKey || ""}
                  onChange={(e) => setComms({ ...comms, resendApiKey: e.target.value })}
                  placeholder="re_••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sender Email Address</label>
                <input
                  type="email"
                  value={comms.senderEmail || ""}
                  onChange={(e) => setComms({ ...comms, senderEmail: e.target.value })}
                  placeholder="notifications@skorvia.com"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sender Display Name</label>
                <input
                  type="text"
                  value={comms.senderName || ""}
                  onChange={(e) => setComms({ ...comms, senderName: e.target.value })}
                  placeholder="Skorvia Platform"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Loops Fallback Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
                <Icon icon="solar:chat-round-line-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Loops.so Marketing &amp; Transactional CRM</h6>
                <p className="text-[11px] text-slate-400">Automated drip campaigns, newsletter broadcasts, and user lifecycle events.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Loops API Key</label>
                <input
                  type="password"
                  value={comms.loopsApiKey || ""}
                  onChange={(e) => setComms({ ...comms, loopsApiKey: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Verify Email Template ID</label>
                <input
                  type="text"
                  value={comms.loopsVerifyEmailTemplateId || ""}
                  onChange={(e) => setComms({ ...comms, loopsVerifyEmailTemplateId: e.target.value })}
                  placeholder="tmpl_verify_123"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Password Reset Template ID</label>
                <input
                  type="text"
                  value={comms.loopsResetPasswordTemplateId || ""}
                  onChange={(e) => setComms({ ...comms, loopsResetPasswordTemplateId: e.target.value })}
                  placeholder="tmpl_reset_456"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          <DnsDomainValidator />
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 6. Payment Gateways Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "payments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon icon="solar:card-2-bold-duotone" className="h-5 w-5 text-primary" />
                <span>Multi-Gateway Payment Channels &amp; Credentials</span>
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Activate or deactivate individual gateways. Activated channels automatically appear as options in customer checkout.
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveCategory("payments")}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
            >
              {isPending ? "Saving..." : "Save Gateway Keys"}
            </button>
          </div>

          {/* 1. Paystack Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Icon icon="solar:card-2-bold-duotone" className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Paystack (Nigeria &amp; Africa - NGN)</h6>
                  <p className="text-[11px] text-slate-400">Direct debit cards, USSD, Apple Pay, and automated recurring billing.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${payments.paystackEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                  {payments.paystackEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={payments.paystackEnabled ?? true}
                  onChange={(e) => setPayments({ ...payments, paystackEnabled: e.target.checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Public Key</label>
                <input
                  type="text"
                  value={payments.paystackPublicKey || ""}
                  onChange={(e) => setPayments({ ...payments, paystackPublicKey: e.target.value })}
                  placeholder="pk_live_••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Secret Key</label>
                <input
                  type="password"
                  value={payments.paystackSecretKey || ""}
                  onChange={(e) => setPayments({ ...payments, paystackSecretKey: e.target.value })}
                  placeholder="sk_live_••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Flutterwave Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Icon icon="solar:wallet-bold-duotone" className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Flutterwave (Pan-Africa &amp; Multi-Currency)</h6>
                  <p className="text-[11px] text-slate-400">Supports NGN, USD, KES, GHS, Mobile Money, and credit cards.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${payments.flutterwaveEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                  {payments.flutterwaveEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={payments.flutterwaveEnabled ?? true}
                  onChange={(e) => setPayments({ ...payments, flutterwaveEnabled: e.target.checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Public Key</label>
                <input
                  type="text"
                  value={payments.flutterwavePublicKey || ""}
                  onChange={(e) => setPayments({ ...payments, flutterwavePublicKey: e.target.value })}
                  placeholder="FLWPUBK-••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Secret Key</label>
                <input
                  type="password"
                  value={payments.flutterwaveSecretKey || ""}
                  onChange={(e) => setPayments({ ...payments, flutterwaveSecretKey: e.target.value })}
                  placeholder="FLWSECK-••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Encryption Key</label>
                <input
                  type="password"
                  value={payments.flutterwaveEncryptionKey || ""}
                  onChange={(e) => setPayments({ ...payments, flutterwaveEncryptionKey: e.target.value })}
                  placeholder="FLWSECK_APIC••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. LemonSqueezy / Stripe Global Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Icon icon="solar:global-bold-duotone" className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">LemonSqueezy / Stripe (Global USD)</h6>
                  <p className="text-[11px] text-slate-400">Global merchant of record, automated VAT/sales tax handling, and international credit cards.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${payments.lemonsqueezyEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                  {payments.lemonsqueezyEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={payments.lemonsqueezyEnabled ?? true}
                  onChange={(e) => setPayments({ ...payments, lemonsqueezyEnabled: e.target.checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">API Key</label>
                <input
                  type="password"
                  value={payments.lemonsqueezyApiKey || ""}
                  onChange={(e) => setPayments({ ...payments, lemonsqueezyApiKey: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Store ID</label>
                <input
                  type="text"
                  value={payments.lemonsqueezyStoreId || ""}
                  onChange={(e) => setPayments({ ...payments, lemonsqueezyStoreId: e.target.value })}
                  placeholder="12345"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Webhook Secret</label>
                <input
                  type="password"
                  value={payments.lemonsqueezyWebhookSecret || ""}
                  onChange={(e) => setPayments({ ...payments, lemonsqueezyWebhookSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Direct Bank Wire Transfer Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300">
                  <Icon icon="solar:bill-list-bold-duotone" className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Direct Bank Wire &amp; Offline Transfers</h6>
                  <p className="text-[11px] text-slate-400">Allows customers to wire funds and upload receipts for manual admin verification.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${payments.manualPaymentEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                  {payments.manualPaymentEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={payments.manualPaymentEnabled ?? true}
                  onChange={(e) => setPayments({ ...payments, manualPaymentEnabled: e.target.checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Bank Name</label>
                <input
                  type="text"
                  value={payments.manualPaymentBankName || ""}
                  onChange={(e) => setPayments({ ...payments, manualPaymentBankName: e.target.value })}
                  placeholder="Zenith Bank PLC / Chase"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Account Number</label>
                <input
                  type="text"
                  value={payments.manualPaymentAccountNumber || ""}
                  onChange={(e) => setPayments({ ...payments, manualPaymentAccountNumber: e.target.value })}
                  placeholder="0123456789"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Account Name</label>
                <input
                  type="text"
                  value={payments.manualPaymentAccountName || ""}
                  onChange={(e) => setPayments({ ...payments, manualPaymentAccountName: e.target.value })}
                  placeholder="Skorvia Technologies Ltd"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Payment Instructions</label>
                <input
                  type="text"
                  value={payments.manualPaymentInstructions || ""}
                  onChange={(e) => setPayments({ ...payments, manualPaymentInstructions: e.target.value })}
                  placeholder="Please include your registered email address in the bank transfer narration."
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 7. Social Auth & Bot Defense Category */}
      {/* ---------------------------------------------------------------- */}
      {activeCategory === "auth" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Icon icon="solar:shield-keyhole-bold-duotone" className="h-5 w-5 text-primary" />
                <span>OAuth Social Logins &amp; Bot Defense</span>
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure 1-click Google / GitHub sign-in credentials and Cloudflare Turnstile CAPTCHA.
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveCategory("auth")}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm"
            >
              {isPending ? "Saving..." : "Save Auth Keys"}
            </button>
          </div>

          {/* Google OAuth */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Icon icon="solar:user-circle-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Google OAuth 2.0 Single Sign-On</h6>
                <p className="text-[11px] text-slate-400">1-click "Sign in with Google" button on login and signup pages.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Google Client ID</label>
                <input
                  type="text"
                  value={auth.googleClientId || ""}
                  onChange={(e) => setAuth({ ...auth, googleClientId: e.target.value })}
                  placeholder="••••••••.apps.googleusercontent.com"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Google Client Secret</label>
                <input
                  type="password"
                  value={auth.googleClientSecret || ""}
                  onChange={(e) => setAuth({ ...auth, googleClientSecret: e.target.value })}
                  placeholder="GOCSPX-••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cloudflare Turnstile */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5" />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">Cloudflare Turnstile CAPTCHA &amp; Bot Defense</h6>
                <p className="text-[11px] text-slate-400">Invisible, privacy-first bot mitigation for login, register, and payment checkout.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Turnstile Site Key (Public)</label>
                <input
                  type="text"
                  value={auth.turnstileSiteKey || ""}
                  onChange={(e) => setAuth({ ...auth, turnstileSiteKey: e.target.value })}
                  placeholder="0x4AAAAAAA••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Turnstile Secret Key (Server)</label>
                <input
                  type="password"
                  value={auth.turnstileSecretKey || ""}
                  onChange={(e) => setAuth({ ...auth, turnstileSecretKey: e.target.value })}
                  placeholder="0x4AAAAAAA••••••••"
                  className="h-9 w-full rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
