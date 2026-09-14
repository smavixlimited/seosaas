import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  FileText,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  RefreshCw,
  Globe,
  Award,
  Layers,
  Clock,
  Eye,
  Trash2,
  Edit3,
  Plug,
  Zap,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  Link2,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import {
  discoverContentTopics,
  generateArticle,
  listArticles,
  updateArticle,
  deleteArticle,
  getPublishingIntegrations,
  savePublishingIntegration,
  testPublishingConnection,
  publishArticle,
} from "@/serverFunctions/ai-content";
import type {
  DiscoveredTopic,
  GeneratedArticle,
} from "@/services/ai-content-engine.service";
import type { PublishingIntegrationConfig } from "@/services/content-publishing.service";
import { FeatureUpgradeGate } from "@/client/components/billing/FeatureUpgradeGate";

export function ContentEngineStudio({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "topics" | "articles" | "integrations"
  >("topics");
  const [selectedTopic, setSelectedTopic] = useState<DiscoveredTopic | null>(
    null,
  );
  const [activeArticle, setActiveArticle] = useState<GeneratedArticle | null>(
    null,
  );
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);
  const [customKeywordInput, setCustomKeywordInput] = useState("");
  const [customBriefInput, setCustomBriefInput] = useState("");

  // Integrations state
  const [wpUrl, setWpUrl] = useState("");
  const [wpUser, setWpUser] = useState("");
  const [wpAppPass, setWpAppPass] = useState("");
  const [shopifyUrl, setShopifyUrl] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");
  const [shopifyBlogId, setShopifyBlogId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [autoPublishMode, setAutoPublishMode] = useState<
    "require_approval" | "autopilot"
  >("require_approval");
  const [publishFrequency, setPublishFrequency] = useState<
    "daily" | "weekly" | "biweekly" | "manual"
  >("weekly");

  // 1. Queries
  const topicsQuery = useQuery({
    queryKey: ["content-topics", projectId],
    queryFn: () => discoverContentTopics({ data: { projectId } }),
  });

  const articlesQuery = useQuery({
    queryKey: ["content-articles", projectId],
    queryFn: () => listArticles({ data: { projectId } }),
  });

  const integrationsQuery = useQuery({
    queryKey: ["publishing-integrations", projectId],
    queryFn: async () => {
      const data = await getPublishingIntegrations({ data: { projectId } });
      const wp = data.find((i) => i.platform === "wordpress");
      if (wp) {
        setWpUrl(wp.apiUrl || "");
        setWpUser(wp.credentials.username || "");
        setWpAppPass(wp.credentials.applicationPassword || "");
        setAutoPublishMode(wp.autoPublishMode);
        setPublishFrequency(wp.publishFrequency);
      }
      const sh = data.find((i) => i.platform === "shopify");
      if (sh) {
        setShopifyUrl(sh.apiUrl || "");
        setShopifyToken(sh.credentials.accessToken || "");
        setShopifyBlogId(sh.credentials.blogId || "");
      }
      const wh = data.find((i) => i.platform === "webhook");
      if (wh) {
        setWebhookUrl(wh.apiUrl || "");
      }
      return data;
    },
  });

  // 2. Mutations
  const generateArticleMutation = useMutation({
    mutationFn: (input: {
      targetKeyword: string;
      customTitle?: string;
      customBrief?: string;
    }) =>
      generateArticle({
        data: {
          projectId,
          targetKeyword: input.targetKeyword,
          customTitle: input.customTitle,
          customBrief: input.customBrief,
        },
      }),
    onSuccess: (article) => {
      queryClient.invalidateQueries({
        queryKey: ["content-articles", projectId],
      });
      toast.success(`Generated 1,800+ word article: "${article.title}"`);
      setActiveArticle(article);
      setActiveTab("articles");
    },
    onError: (err: any) => {
      if (
        err.message?.includes("Upgrade") ||
        err.message?.includes("plan") ||
        err.status === 403
      ) {
        setShowUpgradeGate(true);
      } else {
        toast.error(err.message || "Failed to generate article");
      }
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      deleteArticle({ data: { projectId, articleId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["content-articles", projectId],
      });
      toast.success("Article deleted");
      if (activeArticle) setActiveArticle(null);
    },
  });

  const saveWpMutation = useMutation({
    mutationFn: () =>
      savePublishingIntegration({
        data: {
          projectId,
          platform: "wordpress",
          isEnabled: Boolean(wpUrl && wpUser && wpAppPass),
          apiUrl: wpUrl,
          credentials: { username: wpUser, applicationPassword: wpAppPass },
          autoPublishMode,
          publishFrequency,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["publishing-integrations", projectId],
      });
      toast.success("WordPress integration settings saved!");
    },
    onError: (err: any) => {
      if (
        err.message?.includes("Upgrade") ||
        err.message?.includes("plan") ||
        err.status === 403
      ) {
        setShowUpgradeGate(true);
      } else {
        toast.error(err.message || "Failed to save settings");
      }
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (platform: "wordpress" | "shopify" | "webhook") =>
      testPublishingConnection({ data: { projectId, platform } }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    },
  });

  const publishArticleMutation = useMutation({
    mutationFn: (vars: {
      articleId: string;
      platform?: "wordpress" | "shopify" | "webhook";
    }) =>
      publishArticle({
        data: {
          projectId,
          articleId: vars.articleId,
          platform: vars.platform,
        },
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["content-articles", projectId],
      });
      if (res.success) {
        toast.success(res.message);
        if (activeArticle) {
          setActiveArticle({
            ...activeArticle,
            status: "published",
            publishedUrl: res.publishedUrl || null,
          });
        }
      } else {
        toast.error(res.message);
      }
    },
    onError: (err: any) => {
      if (
        err.message?.includes("Upgrade") ||
        err.message?.includes("plan") ||
        err.status === 403
      ) {
        setShowUpgradeGate(true);
      } else {
        toast.error(err.message || "Failed to publish article");
      }
    },
  });

  const topics = topicsQuery.data || [];
  const articles = articlesQuery.data || [];
  const integrations = integrationsQuery.data || [];

  const totalWords = articles.reduce((acc, a) => acc + (a.wordCount || 0), 0);
  const publishedCount = articles.filter(
    (a) => a.status === "published",
  ).length;
  const connectedPlatformsCount = integrations.filter(
    (i) => i.isEnabled,
  ).length;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-base-100 to-base-200/50 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
              <span>Deep SERP AI Writer & Multi-Channel Publisher</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Autonomous AI SEO Content & Auto-Publishing Engine
            </h2>
            <p className="text-sm md:text-base text-base-content/80 leading-relaxed">
              Discover high-intent keyword gaps from competitor scans, generate
              authoritative 1,800+ word long-form articles with JSON-LD schema,
              and auto-publish directly to WordPress, Shopify, or Webhooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("integrations")}
              className="btn btn-outline btn-sm md:btn-md gap-2 rounded-xl shadow-sm"
            >
              <Plug className="w-4 h-4" />
              <span>Publishing Connectors</span>
            </button>

            <button
              onClick={() => {
                if (topics.length > 0) {
                  generateArticleMutation.mutate({
                    targetKeyword: topics[0].targetKeyword,
                    customTitle: topics[0].suggestedTitle,
                  });
                } else {
                  setActiveTab("topics");
                }
              }}
              disabled={generateArticleMutation.isPending}
              className="btn btn-primary btn-sm md:btn-md gap-2 rounded-xl shadow-sm"
            >
              <Zap
                className={`w-4 h-4 ${generateArticleMutation.isPending ? "animate-spin" : ""}`}
              />
              <span>
                {generateArticleMutation.isPending
                  ? "Writing 1,800+ Words..."
                  : "Auto-Write Next Opportunity"}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-base-content/10">
          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Discovered Topics</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-primary">
              {topics.length} Opportunities
            </div>
          </div>

          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Articles Generated</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {articles.length} Guides
            </div>
          </div>

          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Total Word Count</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {totalWords.toLocaleString()} Words
            </div>
          </div>

          <div className="bg-base-100/60 backdrop-blur rounded-xl p-3.5 border border-base-300/50">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Live Published</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-600">
              {publishedCount} Published
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-base-200/70 rounded-xl border border-base-300">
          <button
            onClick={() => setActiveTab("topics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === "topics"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Topic Opportunities ({topics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === "articles"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Articles & Publishing Queue ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("integrations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === "integrations"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Plug className="w-4 h-4" />
            <span>3. Connectors & Autopilot</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TOPIC OPPORTUNITIES */}
      {activeTab === "topics" && (
        <div className="space-y-6">
          {/* Custom Instant Article Generator Bar */}
          <div className="bg-base-100 p-5 rounded-2xl border border-base-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant Custom SEO Article Generator</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                placeholder="Enter target primary keyword (e.g. B2B SaaS Onboarding)"
                className="input input-bordered input-sm text-xs rounded-xl w-full"
              />
              <input
                type="text"
                value={customBriefInput}
                onChange={(e) => setCustomBriefInput(e.target.value)}
                placeholder="Optional editorial angle or specific requirements"
                className="input input-bordered input-sm text-xs rounded-xl w-full"
              />
              <button
                onClick={() => {
                  if (!customKeywordInput.trim()) {
                    toast.error("Please enter a target keyword");
                    return;
                  }
                  generateArticleMutation.mutate({
                    targetKeyword: customKeywordInput,
                    customBrief: customBriefInput,
                  });
                }}
                disabled={generateArticleMutation.isPending}
                className="btn btn-primary btn-sm rounded-xl gap-2 shadow-sm"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${generateArticleMutation.isPending ? "animate-spin" : ""}`}
                />
                <span>Generate Complete Long-Form Article</span>
              </button>
            </div>
          </div>

          {/* Topics List */}
          {topicsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-base-100 rounded-2xl border border-base-200 gap-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-base-content/80">
                Analyzing competitor keyword gaps and synthesizing high-intent
                content opportunities...
              </p>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center p-12 bg-base-100 rounded-2xl border border-dashed border-base-300 space-y-3">
              <BookOpen className="w-10 h-10 text-base-content/40 mx-auto" />
              <h4 className="font-semibold text-base">
                No Topics Generated Yet
              </h4>
              <p className="text-xs text-base-content/70 max-w-sm mx-auto">
                Click below to analyze your competitor gaps and generate fresh
                high-ranking content angles.
              </p>
              <button
                onClick={() => topicsQuery.refetch()}
                className="btn btn-primary btn-sm rounded-xl"
              >
                Scan Content Opportunities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-base-100 rounded-2xl border border-base-200 hover:border-primary/40 transition-all p-5 shadow-sm flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge badge-primary badge-sm font-bold text-[11px]">
                        {topic.intent} Intent
                      </span>
                      <span className="text-xs text-base-content/60">
                        Est. {topic.estimatedSearchVolume.toLocaleString()} / mo
                        searches
                      </span>
                    </div>

                    <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">
                      {topic.suggestedTitle}
                    </h3>

                    <p className="text-xs text-base-content/70">
                      <strong>Keyword:</strong> &quot;{topic.targetKeyword}
                      &quot; • <strong>KD:</strong> {topic.difficulty}/100
                    </p>

                    <p className="text-xs text-base-content/80 leading-relaxed bg-base-200/40 p-3 rounded-xl border border-base-300/60">
                      {topic.opportunityReason}
                    </p>

                    {/* Outline Accordion Preview */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                        Suggested Section Architecture:
                      </span>
                      <ul className="text-xs space-y-1 text-base-content/80 list-disc list-inside">
                        {topic.suggestedOutline.map((sec, idx) => (
                          <li key={idx} className="truncate">
                            {sec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-3">
                    <button
                      onClick={() =>
                        generateArticleMutation.mutate({
                          targetKeyword: topic.targetKeyword,
                          customTitle: topic.suggestedTitle,
                        })
                      }
                      disabled={generateArticleMutation.isPending}
                      className="btn btn-primary btn-sm w-full gap-2 rounded-xl shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Write Full 1,800+ Word Article</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARTICLES & PUBLISHING QUEUE */}
      {activeTab === "articles" && (
        <div className="space-y-4">
          {articlesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-base-100 rounded-2xl border border-base-200 gap-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-base-content/80">
                Loading generated articles...
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center p-12 bg-base-100 rounded-2xl border border-dashed border-base-300 space-y-3">
              <FileText className="w-10 h-10 text-base-content/40 mx-auto" />
              <h4 className="font-semibold text-base">
                No Articles Generated Yet
              </h4>
              <p className="text-xs text-base-content/70 max-w-sm mx-auto">
                Head over to the &quot;Topic Opportunities&quot; tab to generate
                your first deep SEO article.
              </p>
              <button
                onClick={() => setActiveTab("topics")}
                className="btn btn-primary btn-sm rounded-xl"
              >
                Explore Topics
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-base-100 rounded-2xl border border-base-200 hover:border-primary/40 transition-all p-5 md:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`badge badge-sm font-bold text-[11px] ${
                          art.status === "published"
                            ? "badge-success text-white"
                            : art.status === "queued"
                              ? "badge-warning"
                              : "badge-ghost"
                        }`}
                      >
                        {art.status.toUpperCase()}
                      </span>

                      <span className="badge badge-sm badge-outline text-[11px] text-primary font-bold">
                        SEO Score: {art.seoScore}/100
                      </span>

                      <span className="text-xs text-base-content/60">
                        {art.wordCount.toLocaleString()} words • Target: &quot;
                        {art.targetKeyword}&quot;
                      </span>
                    </div>

                    <h3 className="font-bold text-base md:text-lg">
                      {art.title}
                    </h3>

                    <p className="text-xs md:text-sm text-base-content/80 line-clamp-2">
                      {art.metaDescription}
                    </p>

                    {art.publishedUrl && (
                      <div className="pt-1">
                        <a
                          href={art.publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20"
                        >
                          <span>Live URL: {art.publishedUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to="/p/$projectId/rank-tracking"
                        params={{ projectId }}
                        className="inline-flex items-center gap-1 text-[11px] text-base-content/70 hover:text-primary transition-colors bg-base-200/60 px-2 py-1 rounded-md"
                      >
                        <BarChart2 className="w-3 h-3 text-secondary" />
                        <span>Track Rank</span>
                      </Link>
                      <Link
                        to="/p/$projectId/backlinks"
                        params={{ projectId }}
                        className="inline-flex items-center gap-1 text-[11px] text-base-content/70 hover:text-primary transition-colors bg-base-200/60 px-2 py-1 rounded-md"
                      >
                        <Link2 className="w-3 h-3 text-primary" />
                        <span>Find Backlinks</span>
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center lg:flex-col lg:items-end gap-2.5 min-w-[200px]">
                    <button
                      onClick={() => setActiveArticle(art)}
                      className="btn btn-outline btn-sm w-full gap-1.5 rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview & Edit</span>
                    </button>

                    <button
                      onClick={() =>
                        publishArticleMutation.mutate({ articleId: art.id })
                      }
                      disabled={publishArticleMutation.isPending}
                      className="btn btn-primary btn-sm w-full gap-1.5 rounded-xl shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {art.status === "published"
                          ? "Re-Publish"
                          : "Publish Now"}
                      </span>
                    </button>

                    <button
                      onClick={() => deleteArticleMutation.mutate(art.id)}
                      className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PUBLISHING CONNECTORS & AUTOPILOT */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WordPress Connector Card */}
          <div className="bg-base-100 rounded-2xl border border-base-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg">
                  W
                </div>
                <div>
                  <h3 className="font-bold text-base">WordPress REST API</h3>
                  <p className="text-xs text-base-content/70">
                    Publish directly to your WordPress Blog as Draft or Live
                  </p>
                </div>
              </div>

              <span
                className={`badge badge-sm font-semibold ${
                  wpUrl ? "badge-success text-white" : "badge-ghost"
                }`}
              >
                {wpUrl ? "Configured" : "Not Connected"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-base-content/80 block mb-1">
                  WordPress Site URL:
                </label>
                <input
                  type="url"
                  value={wpUrl}
                  onChange={(e) => setWpUrl(e.target.value)}
                  placeholder="https://yourblog.com"
                  className="input input-bordered input-sm w-full text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-base-content/80 block mb-1">
                    WP Username:
                  </label>
                  <input
                    type="text"
                    value={wpUser}
                    onChange={(e) => setWpUser(e.target.value)}
                    placeholder="admin"
                    className="input input-bordered input-sm w-full text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 block mb-1">
                    Application Password:
                  </label>
                  <input
                    type="password"
                    value={wpAppPass}
                    onChange={(e) => setWpAppPass(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="input input-bordered input-sm w-full text-xs rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Publishing Mode Settings */}
            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Autopilot & Frequency Settings
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-base-content/70 block mb-1">
                    Publishing Workflow:
                  </label>
                  <select
                    value={autoPublishMode}
                    onChange={(e) => setAutoPublishMode(e.target.value as any)}
                    className="select select-bordered select-xs w-full text-xs font-semibold"
                  >
                    <option value="require_approval">
                      Require Manual Approval
                    </option>
                    <option value="autopilot">
                      Full Autopilot (Auto-Publish)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-base-content/70 block mb-1">
                    Cadence Frequency:
                  </label>
                  <select
                    value={publishFrequency}
                    onChange={(e) => setPublishFrequency(e.target.value as any)}
                    className="select select-bordered select-xs w-full text-xs font-semibold"
                  >
                    <option value="daily">Daily (1 / day)</option>
                    <option value="weekly">Weekly (1 / week)</option>
                    <option value="biweekly">Bi-weekly (2 / week)</option>
                    <option value="manual">Manual Execution Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => testConnectionMutation.mutate("wordpress")}
                disabled={testConnectionMutation.isPending || !wpUrl}
                className="btn btn-outline btn-xs gap-1"
              >
                <RefreshCw
                  className={`w-3 h-3 ${testConnectionMutation.isPending ? "animate-spin" : ""}`}
                />
                <span>Test Connection</span>
              </button>

              <button
                onClick={() => saveWpMutation.mutate()}
                disabled={saveWpMutation.isPending}
                className="btn btn-primary btn-sm gap-1.5 rounded-xl shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save WordPress Connector</span>
              </button>
            </div>
          </div>

          {/* Shopify & Universal Webhook Connectors Card */}
          <div className="space-y-6">
            {/* Shopify */}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    S
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Shopify Store Blog</h3>
                    <p className="text-xs text-base-content/70">
                      Auto-publish blog articles to Shopify Online Store
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="url"
                  value={shopifyUrl}
                  onChange={(e) => setShopifyUrl(e.target.value)}
                  placeholder="https://your-store.myshopify.com"
                  className="input input-bordered input-sm w-full text-xs rounded-xl"
                />
                <input
                  type="password"
                  value={shopifyToken}
                  onChange={(e) => setShopifyToken(e.target.value)}
                  placeholder="Admin API Access Token (shpat_...)"
                  className="input input-bordered input-sm w-full text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Universal Webhook */}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-lg">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      Universal Publishing Webhook
                    </h3>
                    <p className="text-xs text-base-content/70">
                      Send JSON payloads to Zapier, Make, Next.js, or custom CMS
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="input input-bordered input-sm w-full text-xs rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Article Editor / Preview Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm font-semibold">
                    SEO Article
                  </span>
                  <span className="badge badge-outline badge-sm font-bold text-emerald-600">
                    SEO Score: {activeArticle.seoScore}/100
                  </span>
                  <span className="text-xs text-base-content/60">
                    {activeArticle.wordCount.toLocaleString()} words
                  </span>
                </div>
                <h3 className="font-bold text-lg md:text-xl truncate max-w-xl">
                  {activeArticle.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="btn btn-ghost btn-sm btn-square rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Body Preview */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Meta & Schema Summary */}
              <div className="p-4 bg-base-200/40 rounded-xl border border-base-300 space-y-2 text-xs">
                <div>
                  <strong>URL Slug:</strong>{" "}
                  <code className="bg-base-200 px-1.5 py-0.5 rounded text-primary">
                    /{activeArticle.slug}
                  </code>
                </div>
                <div>
                  <strong>Meta Description:</strong>{" "}
                  <span className="text-base-content/80">
                    {activeArticle.metaDescription}
                  </span>
                </div>
                <div>
                  <strong>Secondary Keywords:</strong>{" "}
                  <span className="text-base-content/80">
                    {activeArticle.secondaryKeywords.join(", ")}
                  </span>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                    Article Body (Markdown & JSON-LD Ready):
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activeArticle.contentMarkdown,
                        "Article Markdown",
                      )
                    }
                    className="btn btn-ghost btn-xs gap-1 text-primary"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Markdown</span>
                  </button>
                </div>

                <textarea
                  value={activeArticle.contentMarkdown}
                  onChange={(e) =>
                    setActiveArticle({
                      ...activeArticle,
                      contentMarkdown: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered w-full h-80 text-xs md:text-sm font-mono leading-relaxed p-4 bg-base-200/20"
                />
              </div>

              {/* JSON-LD Schema Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                    JSON-LD Structured Data Schema:
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(activeArticle.schemaJson, null, 2),
                        "Schema JSON-LD",
                      )
                    }
                    className="btn btn-ghost btn-xs gap-1 text-primary"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Schema</span>
                  </button>
                </div>
                <pre className="p-3 bg-base-200 rounded-xl text-[11px] font-mono overflow-x-auto text-base-content/80">
                  {JSON.stringify(activeArticle.schemaJson, null, 2)}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-5 border-t border-base-200 flex items-center justify-between bg-base-200/20">
              <button
                onClick={() => setActiveArticle(null)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    publishArticleMutation.mutate({
                      articleId: activeArticle.id,
                    })
                  }
                  disabled={publishArticleMutation.isPending}
                  className="btn btn-primary btn-sm gap-2 rounded-xl shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {publishArticleMutation.isPending
                      ? "Publishing..."
                      : "Publish to Connected CMS"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Gate */}
      {showUpgradeGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowUpgradeGate(false)}
              className="absolute top-4 right-4 z-10 btn btn-ghost btn-sm btn-square rounded-full"
            >
              ✕
            </button>
            <FeatureUpgradeGate
              featureTitle="Autonomous AI Content Engine & Auto-Publishing"
              featureDescription="Auto-discover keyword opportunities, generate complete 1,800+ word articles with JSON-LD schema, and auto-publish directly to WordPress or Shopify."
              requiredPlanName="Pro or Agency Plan"
              bullets={[
                "Uncapped 1,800+ word deep SEO article generation",
                "Direct 1-click publishing to WordPress, Shopify, & Webhooks",
                "Hands-free scheduled autopilot publishing cadence",
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
