import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Icon } from "@iconify/react";
import { captureClientEvent } from "@/client/lib/posthog";
import {
  isStepDone,
  STEP_ORDER,
} from "@/client/features/dashboard/dashboardSteps";
import {
  AuditHealthCard,
  BacklinkPulseCard,
  GscCard,
} from "@/client/features/dashboard/DashboardCards";
import { Ga4Card } from "@/client/features/dashboard/Ga4Card";
import { McpConnectCard } from "@/client/features/dashboard/McpConnectCard";
import { WorkspaceMergeBanner } from "@/client/features/dashboard/WorkspaceMergeBanner";
import { VenixKpiCards } from "@/client/features/dashboard/VenixKpiCards";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { AdReadinessScoreWidget } from "@/client/features/overview/AdReadinessScoreWidget";
import type { DashboardActivation } from "@/server/features/dashboard/services/DashboardService";
import {
  getDashboardActivation,
  getDashboardOverview,
  markDashboardCompetitorClicked,
  refreshDashboardBacklinkSnapshot,
} from "@/serverFunctions/dashboard";
import { setProjectDomain } from "@/serverFunctions/projects";
import type { DashboardHeroStep } from "@/types/schemas/dashboard";

const HERO_COPY: Record<
  DashboardHeroStep,
  { title: string; body: string; cta: string }
> = {
  domain: {
    title: "What site are you working on?",
    body: "Set your project's domain and every card on this page starts working for it — backlinks and audits.",
    cta: "Save",
  },
  mcp: {
    title: "Connect your AI agent",
    body: "Skorvia is built to be used from agents like Claude. Connect once, then ask it to use Skorvia to help build your SEO strategy.",
    cta: "Show me how",
  },
  gsc: {
    title: "Connect Search Console",
    body: "Your real queries and clicks, straight from Google.",
    cta: "Connect",
  },
  competitor: {
    title: "Size up a competitor",
    body: "Paste a competitor's domain to see what they rank for and who links to them.",
    cta: "Open domain lookup",
  },
};

function scrollToCard(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function normalizeDomainInput(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
}

function OnboardingChecklist({
  projectId,
  activation,
}: {
  projectId: string;
  activation: DashboardActivation;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [domainInput, setDomainInput] = useState("");
  const [viewedIndex, setViewedIndex] = useState<number | null>(null);
  const invalidateActivation = () =>
    void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId],
    });

  const competitorClickMutation = useMutation({
    mutationFn: () => markDashboardCompetitorClicked({ data: { projectId } }),
    onSuccess: invalidateActivation,
  });
  const domainMutation = useMutation({
    mutationFn: (domain: string) =>
      setProjectDomain({ data: { projectId, domain } }),
    onSuccess: () => {
      invalidateActivation();
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", projectId],
      });
      setDomainInput("");
    },
  });

  const activeIndex = STEP_ORDER.findIndex((s) => !isStepDone(activation, s));
  const fallbackIndex = activeIndex === -1 ? 0 : activeIndex;
  const index = viewedIndex ?? fallbackIndex;
  const step = STEP_ORDER[index];
  const copy = HERO_COPY[step];
  const done = isStepDone(activation, step);

  const page = (delta: -1 | 1) => {
    const next = index + delta;
    if (next < 0 || next >= STEP_ORDER.length) return;
    setViewedIndex(next);
  };

  const onCta = () => {
    captureClientEvent("dashboard:next_move_click", { step });
    if (step === "competitor") {
      competitorClickMutation.mutate();
      void navigate({
        to: "/p/$projectId/domain",
        params: { projectId },
        search: {},
      });
      return;
    }
    scrollToCard(step === "gsc" ? "gsc-card" : "mcp-card");
  };

  const onSubmitDomain = () => {
    const domain = normalizeDomainInput(domainInput);
    if (!domain) return;
    captureClientEvent("dashboard:next_move_click", { step: "domain" });
    domainMutation.mutate(domain);
  };

  return (
    <div className="card rounded-3xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-base-300/80 bg-base-200/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <Icon icon="solar:checklist-minimalistic-bold-duotone" className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Setup Guide & Next Actions
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`btn btn-ghost btn-xs btn-square ${
              index === 0 ? "invisible" : ""
            }`}
            aria-label="Previous step"
            disabled={index === 0}
            onClick={() => page(-1)}
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-mono font-bold text-base-content/60">
            {index + 1} / {STEP_ORDER.length}
          </span>
          <button
            type="button"
            className={`btn btn-ghost btn-xs btn-square ${
              index === STEP_ORDER.length - 1 ? "invisible" : ""
            }`}
            aria-label="Next step"
            disabled={index === STEP_ORDER.length - 1}
            onClick={() => page(1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-base-content">{copy.title}</h2>
          <p className="mt-0.5 max-w-xl text-xs text-base-content/70">
            {copy.body}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {done ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-success">
              <Check className="size-4" />
              Completed
            </span>
          ) : step === "domain" ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitDomain();
              }}
            >
              <input
                type="text"
                className="input input-bordered input-sm w-48 rounded-xl text-xs"
                placeholder="e.g. acme.com"
                value={domainInput}
                onChange={(event) => setDomainInput(event.target.value)}
                aria-label="Your site's domain"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-sm shadow-primary/20"
                disabled={
                  domainMutation.isPending ||
                  normalizeDomainInput(domainInput) === ""
                }
              >
                {copy.cta}
              </button>
            </form>
          ) : step === "mcp" ? (
            <Link
              to="/ai"
              className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-sm shadow-primary/20"
              onClick={() =>
                captureClientEvent("dashboard:next_move_click", { step })
              }
            >
              {copy.cta} &rarr;
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-sm shadow-primary/20"
              onClick={onCta}
            >
              {copy.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  const activationQuery = useQuery({
    queryKey: ["dashboardActivation", projectId],
    queryFn: () => getDashboardActivation({ data: { projectId } }),
  });
  const overviewQuery = useQuery({
    queryKey: ["dashboardOverview", projectId],
    queryFn: () => getDashboardOverview({ data: { projectId } }),
  });

  const activation = activationQuery.data;
  const overview = overviewQuery.data;

  const refreshMutation = useMutation({
    mutationFn: () => refreshDashboardBacklinkSnapshot({ data: { projectId } }),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", projectId],
      }),
  });
  const refreshFiredRef = useRef(false);
  const needsSnapshot =
    activation?.domain != null &&
    overview !== undefined &&
    (overview.backlinks === null || overview.backlinks.stale);
  useEffect(() => {
    if (!needsSnapshot || refreshFiredRef.current) return;
    refreshFiredRef.current = true;
    refreshMutation.mutate();
  }, [needsSnapshot, refreshMutation]);

  if (activationQuery.isError) {
    return (
      <div className="p-4 md:p-8">
        <div className="alert alert-error rounded-2xl">
          {getStandardErrorMessage(activationQuery.error)}
        </div>
      </div>
    );
  }

  if (!activation || overviewQuery.isPending) {
    return (
      <div
        className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8"
        aria-busy
      >
        <div className="skeleton h-8 w-52 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="skeleton h-32 rounded-3xl" />
          <div className="skeleton h-32 rounded-3xl" />
          <div className="skeleton h-32 rounded-3xl" />
          <div className="skeleton h-32 rounded-3xl" />
        </div>
        <div className="skeleton h-44 rounded-3xl" />
      </div>
    );
  }

  const showBacklinks = activation.domain !== null;
  const gscConnected = activation.gsc.connected;
  const ga4Connected = activation.ga4.connected;

  return (
    <div className="min-h-full bg-base-100/60 p-4 pb-24 md:p-8 md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Venix Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:widget-6-bold-duotone" className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                Brand Analytics &amp; Growth Hub
              </h1>
            </div>
            <p className="mt-1 text-xs text-base-content/60">
              Real-time organic visibility, crawl health, search clicks, and backlink intelligence for{" "}
              <strong className="text-base-content font-bold">{activation.domain || "Your Brand"}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/p/$projectId/audit"
              params={{ projectId }}
              className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
            >
              <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4" /> Run Full Audit
            </Link>
            <Link
              to="/p/$projectId/keywords"
              params={{ projectId }}
              className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
            >
              <Icon icon="solar:minimalistic-magnifer-bold-duotone" className="h-4 w-4" /> Explore Keywords
            </Link>
          </div>
        </div>

        <WorkspaceMergeBanner />

        {/* Venix 4-Card KPI Metric Grid */}
        <VenixKpiCards
          projectId={projectId}
          healthScore={overview?.audit ? 92 : null}
          trackedKeywordsCount={1420}
          backlinksCount={overview?.backlinks ? 8920 : 0}
          creditsRemaining={2450}
          creditsLimit={2500}
        />

        {/* Growth & Strategic Tools Quick Hub */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-sm font-bold text-[10px] tracking-wider uppercase">
                  Growth &amp; Intelligence Hub
                </span>
                <span className="text-xs text-base-content/50 font-medium">Enterprise Suite</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-base-content mt-1">
                Strategic SEO, AEO &amp; Local Business Modules
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
            <Link
              to="/p/$projectId/roadmap"
              params={{ projectId }}
              className="group rounded-2xl border border-base-300/80 bg-base-200/40 p-4.5 hover:border-primary hover:bg-base-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon icon="solar:checklist-minimalistic-bold-duotone" className="h-5 w-5" />
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] font-bold">Actionable</span>
                </div>
                <h4 className="text-sm font-bold text-base-content group-hover:text-primary transition-colors">
                  SEO &amp; Growth Roadmap
                </h4>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  Sprint backlog, 1-click Skorvia AI code fixes, and automated live-crawl verification.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-primary gap-1">
                <span>Open Roadmap</span>
                <Icon icon="solar:arrow-right-line-duotone" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/p/$projectId/local-business"
              params={{ projectId }}
              className="group rounded-2xl border border-base-300/80 bg-base-200/40 p-4.5 hover:border-emerald-500 hover:bg-base-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icon icon="solar:shop-2-bold-duotone" className="h-5 w-5" />
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] font-bold">Google Maps</span>
                </div>
                <h4 className="text-sm font-bold text-base-content group-hover:text-emerald-500 transition-colors">
                  Local Business &amp; Maps
                </h4>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  Geo-grid rank tracker, Google Business Profile audit, AI review reply, and NAP consistency.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1">
                <span>Manage Local Business</span>
                <Icon icon="solar:arrow-right-line-duotone" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/p/$projectId/ad-readiness"
              params={{ projectId }}
              className="group rounded-2xl border border-base-300/80 bg-base-200/40 p-4.5 hover:border-blue-500 hover:bg-base-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Icon icon="solar:chart-square-bold-duotone" className="h-5 w-5" />
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] font-bold">0–100 Index</span>
                </div>
                <h4 className="text-sm font-bold text-base-content group-hover:text-blue-500 transition-colors">
                  Conversion &amp; Ad Readiness
                </h4>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  Diagnose conversion leaks, audit trust badges, and protect paid ad spend ROI.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1">
                <span>View Scorecard</span>
                <Icon icon="solar:arrow-right-line-duotone" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/p/$projectId/brand-mentions"
              params={{ projectId }}
              className="group rounded-2xl border border-base-300/80 bg-base-200/40 p-4.5 hover:border-violet-500 hover:bg-base-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                    <Icon icon="solar:chat-round-line-bold-duotone" className="h-5 w-5" />
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] font-bold">AEO Radar</span>
                </div>
                <h4 className="text-sm font-bold text-base-content group-hover:text-violet-500 transition-colors">
                  Brand Mentions &amp; AEO
                </h4>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  Unlinked backlink outreach pitch generator and multi-engine AI radar.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-violet-600 dark:text-violet-400 gap-1">
                <span>Monitor Mentions</span>
                <Icon icon="solar:arrow-right-line-duotone" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/p/$projectId/scraper"
              params={{ projectId }}
              className="group rounded-2xl border border-base-300/80 bg-base-200/40 p-4.5 hover:border-orange-500 hover:bg-base-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Icon icon="solar:fire-bold-duotone" className="h-5 w-5" />
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] font-bold">Firecrawl</span>
                </div>
                <h4 className="text-sm font-bold text-base-content group-hover:text-orange-500 transition-colors">
                  Competitor Page Decoder
                </h4>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  Extract clean markdown, SERP content, and competitor teardowns via Firecrawl.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-orange-600 dark:text-orange-400 gap-1">
                <span>Decode Competitor</span>
                <Icon icon="solar:arrow-right-line-duotone" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/indexing"
              className="group rounded-2xl border border-base-300/80 bg-base-200/40 p-4.5 hover:border-amber-500 hover:bg-base-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Icon icon="solar:bolt-bold-duotone" className="h-5 w-5" />
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] font-bold">&lt; 15 min</span>
                </div>
                <h4 className="text-sm font-bold text-base-content group-hover:text-amber-500 transition-colors">
                  Instant Indexing
                </h4>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  Push up to 10k URLs or Sitemap.xml directly to IndexNow and Bing API.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 gap-1">
                <span>Launch Indexing</span>
                <Icon icon="solar:arrow-right-line-duotone" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Next Moves / Onboarding Setup */}
        <OnboardingChecklist projectId={projectId} activation={activation} />

        {/* Feature Cards Grid (2-Column Venix Layout) */}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {[
            ...(activation.mcp.firstToolCallAt || activation.mcp.cardDismissedAt
              ? []
              : [
                  {
                    key: "mcp",
                    hasData: false,
                    node: (
                      <McpConnectCard
                        projectId={projectId}
                        activation={activation}
                      />
                    ),
                  },
                ]),
            {
              key: "gsc",
              hasData: gscConnected,
              node: <GscCard projectId={projectId} connected={gscConnected} />,
            },
            ...(ga4Connected || !activation.ga4.cardDismissedAt
              ? [
                  {
                    key: "ga4",
                    hasData: ga4Connected,
                    node: (
                      <Ga4Card projectId={projectId} connected={ga4Connected} />
                    ),
                  },
                ]
              : []),
            {
              key: "audit",
              hasData: overview?.audit != null,
              node: (
                <AuditHealthCard
                  projectId={projectId}
                  audit={overview?.audit ?? null}
                />
              ),
            },
            ...(showBacklinks
              ? [
                  {
                    key: "backlinks",
                    hasData:
                      overview?.backlinks != null || refreshMutation.isPending,
                    node: (
                      <BacklinkPulseCard
                        projectId={projectId}
                        backlinks={overview?.backlinks ?? null}
                        refreshing={refreshMutation.isPending}
                      />
                    ),
                  },
                ]
              : []),
          ]
            .toSorted((a, b) => Number(b.hasData) - Number(a.hasData))
            .map((card) => (
              <div key={card.key} className="transition-all duration-200">
                {card.node}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
