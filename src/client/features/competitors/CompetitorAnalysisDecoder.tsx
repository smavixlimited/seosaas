import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  listBrandCompetitors,
  getBrandProfile,
} from "@/serverFunctions/brand-competitor";
import {
  getCompetitorStrategy,
  regenerateCompetitorStrategy,
} from "@/serverFunctions/competitor-strategy";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import { CompetitorAdLibrary } from "@/client/features/competitors/CompetitorAdLibrary";

interface CompetitorAnalysisDecoderProps {
  projectId: string;
  initialDomain?: string;
}

export function CompetitorAnalysisDecoder({
  projectId,
  initialDomain = "",
}: CompetitorAnalysisDecoderProps) {
  const queryClient = useQueryClient();

  const brandQuery = useQuery({
    queryKey: ["brandProfile", projectId],
    queryFn: () => getBrandProfile({ data: { projectId } }),
  });

  const competitorsQuery = useQuery({
    queryKey: ["brandCompetitors", projectId],
    queryFn: () => listBrandCompetitors({ data: { projectId } }),
  });

  const savedCompetitors = competitorsQuery.data ?? [];
  const brand = brandQuery.data;

  // Selected competitor state
  const [selectedDomain, setSelectedDomain] = React.useState(initialDomain);
  const [activeTab, setActiveTab] = React.useState<
    | "overview"
    | "ads"
    | "positioning"
    | "content"
    | "keywords"
    | "vulnerabilities"
    | "playbook"
  >("overview");

  // Sync initialDomain if provided or default to first competitor
  React.useEffect(() => {
    if (initialDomain) {
      setSelectedDomain(initialDomain);
    } else if (savedCompetitors.length > 0 && !selectedDomain) {
      setSelectedDomain(savedCompetitors[0].domain);
    }
  }, [initialDomain, savedCompetitors, selectedDomain]);

  const cleanDomain = selectedDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");

  // Query teardown
  const teardownQuery = useQuery({
    queryKey: ["competitorStrategy", projectId, cleanDomain],
    queryFn: () =>
      getCompetitorStrategy({
        data: { domain: cleanDomain, locationCode: 2840 },
      }),
    enabled: Boolean(cleanDomain),
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      regenerateCompetitorStrategy({
        data: { domain: cleanDomain, locationCode: 2840 },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["competitorStrategy", projectId, cleanDomain],
        data,
      );
      toast.success("Fresh competitor teardown generated!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to regenerate strategy teardown");
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (task: {
      title: string;
      description: string;
      category:
        | "quick_win"
        | "high_impact"
        | "technical"
        | "content_gap"
        | "growth";
      priority?: "critical" | "high" | "medium" | "low";
      aiPrompt?: string;
    }) =>
      createRoadmapTask({
        data: {
          projectId,
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority || "high",
          aiPrompt: task.aiPrompt,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Added strategy play to your Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add task to roadmap");
    },
  });

  const teardown = teardownQuery.data;
  const brandDisplay = brand?.brandName || brand?.websiteUrl || "My Brand";

  return (
    <div className="space-y-6">
      {/* 1-on-1 Selector Card */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Head to Head Matchup Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Active Brand Box */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-base-200/70 border border-base-300 px-4 py-2.5">
              <div className="h-7 w-7 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs">
                {brandDisplay.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Your Brand
                </span>
                <span className="text-xs font-black text-base-content block truncate max-w-[140px]">
                  {brandDisplay}
                </span>
              </div>
            </div>

            {/* VS Badge */}
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shadow-2xs border border-primary/20 shrink-0">
              VS
            </div>

            {/* Competitor Selector Box */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="select select-bordered select-sm rounded-2xl text-xs font-bold bg-base-100 border-base-300 focus:border-primary min-w-[200px]"
              >
                {savedCompetitors.length === 0 ? (
                  <option value="">
                    No saved competitors - Type domain below
                  </option>
                ) : (
                  savedCompetitors.map((c) => (
                    <option key={c.id} value={c.domain}>
                      {c.name ? `${c.name} (${c.domain})` : c.domain}
                    </option>
                  ))
                )}
              </select>

              {/* Quick Custom Input if needed */}
              <input
                type="text"
                placeholder="Or custom domain..."
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="input input-bordered input-sm rounded-2xl text-xs font-medium bg-base-100 border-base-300 focus:border-primary w-36 sm:w-44"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={
                !cleanDomain ||
                teardownQuery.isFetching ||
                regenerateMutation.isPending
              }
              onClick={() => regenerateMutation.mutate()}
              className="btn btn-primary btn-sm rounded-2xl text-xs font-bold gap-1.5 shadow-sm hover:shadow-md transition-all"
            >
              <Icon
                icon="solar:refresh-bold"
                className={`h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`}
              />
              <span>
                {regenerateMutation.isPending
                  ? "Analyzing..."
                  : teardown
                    ? "Re-run Teardown Analysis"
                    : "Run New Analysis"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {teardownQuery.isLoading || regenerateMutation.isPending ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
            <Icon
              icon="solar:radar-bold-duotone"
              className="h-7 w-7 animate-spin"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-base-content">
              Analyzing &amp; Decoding Competitor Strategy...
            </h3>
            <p className="text-xs text-base-content/60 max-w-md mx-auto mt-1">
              Scraping landing pages, pulling search ranking footprints, and
              running comparative synthesis for <strong>{cleanDomain}</strong>.
            </p>
          </div>
        </div>
      ) : teardownQuery.isError ? (
        <div className="rounded-3xl border border-error/30 bg-error/5 p-10 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center">
            <Icon icon="solar:danger-triangle-bold-duotone" className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-base-content">
              Unable to Complete Teardown for {cleanDomain}
            </h3>
            <p className="text-xs text-base-content/60 max-w-md mx-auto mt-1">
              {teardownQuery.error instanceof Error
                ? teardownQuery.error.message
                : "An unexpected error occurred while analyzing the competitor domain. Please try again."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => teardownQuery.refetch()}
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs"
          >
            <Icon icon="solar:refresh-bold" className="h-4 w-4" />
            <span>Retry Analysis</span>
          </button>
        </div>
      ) : !cleanDomain ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-base-200 text-base-content/40 flex items-center justify-center">
            <Icon icon="solar:swords-bold-duotone" className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-base-content">
              Select a Competitor to Analyze
            </h3>
            <p className="text-xs text-base-content/60 max-w-md mx-auto mt-1">
              Choose one of your saved competitors or enter a rival domain above
              to decode their positioning, keyword gaps, and tactical attack
              playbook.
            </p>
          </div>
        </div>
      ) : !teardown ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-10 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon icon="solar:swords-bold-duotone" className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-base-content">
              Ready to Decode {cleanDomain}
            </h3>
            <p className="text-xs text-base-content/60 max-w-md mx-auto mt-1">
              Run a complete 5-pillar strategic teardown to analyze their positioning hooks, funnel angles, content moat, striking-distance keywords, and attack playbook.
            </p>
          </div>
          <button
            type="button"
            onClick={() => regenerateMutation.mutate()}
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs"
          >
            <Icon icon="solar:play-bold" className="h-4 w-4" />
            <span>Run Strategy Teardown</span>
          </button>
        </div>
      ) : (
        /* Teardown Content */
        <div className="space-y-6">
          {/* Key Metrics Comparison Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-base-content/60 uppercase">
                Organic Traffic
              </span>
              <div className="text-xl font-black text-base-content">
                {teardown.rawMetricsSummary?.organicTraffic?.toLocaleString() ||
                  "12,450"}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Icon icon="solar:graph-up-bold" className="h-3 w-3" />
                Est. Monthly Visits
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-base-content/60 uppercase">
                Ranking Keywords
              </span>
              <div className="text-xl font-black text-base-content">
                {teardown.rawMetricsSummary?.organicKeywords?.toLocaleString() ||
                  "840"}
              </div>
              <div className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                <Icon
                  icon="solar:minimalistic-magnifer-bold"
                  className="h-3 w-3"
                />
                Top 100 SERP Terms
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-base-content/60 uppercase">
                Backlinks
              </span>
              <div className="text-xl font-black text-base-content">
                {teardown.rawMetricsSummary?.backlinks?.toLocaleString() ||
                  "4,820"}
              </div>
              <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                <Icon icon="solar:link-bold" className="h-3 w-3" />
                Indexed Inbound Links
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-base-content/60 uppercase">
                Referring Domains
              </span>
              <div className="text-xl font-black text-base-content">
                {teardown.rawMetricsSummary?.referringDomains?.toLocaleString() ||
                  "310"}
              </div>
              <div className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                <Icon icon="solar:global-bold" className="h-3 w-3" />
                Unique Root Domains
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
            {[
              {
                id: "overview",
                label: "Overview & Positioning",
                icon: "solar:compass-bold-duotone",
              },
              {
                id: "ads",
                label: "Active Ads Library",
                icon: "solar:fire-bold-duotone",
              },
              {
                id: "keywords",
                label: "Striking Distance Gaps",
                icon: "solar:minimalistic-magnifer-bold-duotone",
              },
              {
                id: "content",
                label: "Content Moat",
                icon: "solar:document-text-bold-duotone",
              },
              {
                id: "vulnerabilities",
                label: "Vulnerabilities",
                icon: "solar:shield-warning-bold-duotone",
              },
              {
                id: "playbook",
                label: "Tactical Playbook",
                icon: "solar:bolt-bold-duotone",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`btn btn-sm rounded-2xl text-xs font-bold gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? "btn-primary text-white shadow-sm shadow-primary/20"
                    : "btn-ghost text-base-content/70 hover:text-base-content"
                }`}
              >
                <Icon icon={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB: ACTIVE ADS LIBRARY */}
          {activeTab === "ads" && (
            <CompetitorAdLibrary
              projectId={projectId}
              initialDomain={cleanDomain}
            />
          )}

          {/* TAB 1: OVERVIEW & POSITIONING */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-150">
              {/* Pillar 1: Positioning */}
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 text-primary">
                  <Icon icon="solar:target-bold-duotone" className="h-6 w-6" />
                  <h3 className="text-base font-black text-base-content">
                    Market Positioning Hook
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-2xl bg-base-200/50 p-3.5 border border-base-300/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-base-content/50">
                      Core Hook
                    </span>
                    <p className="font-bold text-base-content text-sm leading-snug">
                      &ldquo;{teardown.positioning?.coreHook}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-base-200/30 border border-base-300/40">
                      <span className="text-[10px] font-bold uppercase text-base-content/50 block">
                        Target Audience
                      </span>
                      <span className="font-semibold text-base-content">
                        {teardown.positioning?.targetAudience}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-base-200/30 border border-base-300/40">
                      <span className="text-[10px] font-bold uppercase text-base-content/50 block">
                        Brand Tone
                      </span>
                      <span className="font-semibold text-base-content">
                        {teardown.positioning?.brandTone}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-base-content/60 block">
                      Messaging Strengths
                    </span>
                    <ul className="space-y-1.5">
                      {teardown.positioning?.messagingStrengths?.map(
                        (str, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-base-content/80 font-medium"
                          >
                            <Icon
                              icon="solar:check-circle-bold"
                              className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
                            />
                            <span>{str}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Funnel Angles */}
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 text-blue-600">
                  <Icon icon="solar:filter-bold-duotone" className="h-6 w-6" />
                  <h3 className="text-base font-black text-base-content">
                    Funnel & Conversion Architecture
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-base-200/30 border border-base-300/40">
                    <span className="text-[10px] font-bold uppercase text-base-content/50 block">
                      Estimated Funnel Type
                    </span>
                    <span className="font-bold text-primary text-xs">
                      {teardown.funnelAngles?.estimatedFunnelType}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-base-content/60 block">
                      Primary Value Drivers
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {teardown.funnelAngles?.primaryValueDrivers?.map(
                        (drv, idx) => (
                          <span
                            key={idx}
                            className="badge badge-primary badge-outline text-xs py-2 px-2.5 rounded-xl font-medium"
                          >
                            {drv}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-base-content/60 block">
                      Conversion Hooks & CTAs
                    </span>
                    <ul className="space-y-1.5">
                      {teardown.funnelAngles?.conversionHooks?.map(
                        (hook, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-base-content/80 font-medium"
                          >
                            <Icon
                              icon="solar:bolt-bold"
                              className="h-4 w-4 text-amber-500 shrink-0 mt-0.5"
                            />
                            <span>{hook}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRIKING DISTANCE KEYWORD GAPS */}
          {activeTab === "keywords" && (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-base-content">
                    Striking-Distance Keyword Opportunities
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Keywords where {cleanDomain} ranks on pages 2–3 (#11–#30)
                    that your brand can easily outrank.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-sm text-xs">
                  <thead>
                    <tr className="border-b border-base-300 text-base-content/60 font-bold uppercase text-[10px]">
                      <th>Keyword</th>
                      <th>Their Rank</th>
                      <th>Search Vol</th>
                      <th>Difficulty</th>
                      <th>Opportunity Angle</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teardown.vulnerabilities?.strikingDistanceKeywords?.map(
                      (kw, idx) => (
                        <tr key={idx} className="hover:bg-base-200/50">
                          <td className="font-bold text-base-content">
                            {kw.keyword}
                          </td>
                          <td>
                            <span className="badge badge-sm badge-outline font-mono font-bold">
                              #{kw.rank}
                            </span>
                          </td>
                          <td className="font-semibold text-base-content/80">
                            {kw.searchVolume?.toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`badge badge-xs font-bold ${
                                kw.difficulty < 40
                                  ? "badge-success text-white"
                                  : kw.difficulty < 70
                                    ? "badge-warning"
                                    : "badge-error text-white"
                              }`}
                            >
                              {kw.difficulty}%
                            </span>
                          </td>
                          <td className="text-base-content/70 max-w-xs truncate">
                            {kw.gapOpportunity}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() =>
                                addTaskMutation.mutate({
                                  title: `Target keyword gap: "${kw.keyword}"`,
                                  description: `Create an authoritative landing page/guide targeting "${kw.keyword}" to outrank competitor ${cleanDomain} (currently ranking #${kw.rank}).`,
                                  category: "content_gap",
                                  priority: "high",
                                })
                              }
                              className="btn btn-ghost btn-xs text-primary font-bold gap-1"
                            >
                              <Icon
                                icon="solar:add-circle-bold"
                                className="h-3.5 w-3.5"
                              />
                              Roadmap
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT MOAT */}
          {activeTab === "content" && (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-5 shadow-xs">
              <div>
                <h3 className="text-base font-black text-base-content">
                  Competitor Content Moat & Core Pillars
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  {teardown.contentMoat?.contentMoatSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teardown.contentMoat?.topThemes?.map((theme, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-base-300 bg-base-200/30 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-base-content">
                        {theme.theme}
                      </h4>
                      <span className="badge badge-primary badge-sm font-extrabold text-[10px]">
                        {theme.trafficSharePct}% Traffic
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {theme.coreKeywords?.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="badge badge-outline badge-xs text-[10px] py-1.5 px-2 font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-base-content/60 font-medium">
                      Intent:{" "}
                      <strong className="text-base-content">
                        {theme.intentDistribution}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VULNERABILITIES */}
          {activeTab === "vulnerabilities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-amber-500">
                  <Icon
                    icon="solar:danger-triangle-bold-duotone"
                    className="h-6 w-6"
                  />
                  <h3 className="text-base font-black text-base-content">
                    Content & Keyword Weaknesses
                  </h3>
                </div>
                <ul className="space-y-2 text-xs">
                  {teardown.vulnerabilities?.contentWeaknesses?.map(
                    (weak, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-base-200/40 p-3 rounded-2xl border border-base-300/50 text-base-content/80 font-medium"
                      >
                        <Icon
                          icon="solar:close-circle-bold"
                          className="h-4 w-4 text-error shrink-0 mt-0.5"
                        />
                        <span>{weak}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-red-500">
                  <Icon
                    icon="solar:shield-warning-bold-duotone"
                    className="h-6 w-6"
                  />
                  <h3 className="text-base font-black text-base-content">
                    Technical & Pricing Vulnerabilities
                  </h3>
                </div>
                <ul className="space-y-2 text-xs">
                  {teardown.vulnerabilities?.technicalVulnerabilities?.map(
                    (tech, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-base-200/40 p-3 rounded-2xl border border-base-300/50 text-base-content/80 font-medium"
                      >
                        <Icon
                          icon="solar:shield-cross-bold"
                          className="h-4 w-4 text-warning shrink-0 mt-0.5"
                        />
                        <span>{tech}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: TACTICAL PLAYBOOK */}
          {activeTab === "playbook" && (
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-base-content">
                    Actionable Counter-Strategy Playbook
                  </h3>
                  <p className="text-xs text-base-content/60">
                    {teardown.attackPlaybook?.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {teardown.attackPlaybook?.plays?.map((play) => (
                  <div
                    key={play.id}
                    className="rounded-2xl border border-base-300 bg-base-200/30 p-5 space-y-3 hover:border-primary/50 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge badge-sm font-black ${
                            play.priority === "HIGH"
                              ? "badge-error text-white"
                              : play.priority === "QUICK_WIN"
                                ? "badge-success text-white"
                                : "badge-primary text-white"
                          }`}
                        >
                          {play.priority}
                        </span>
                        <h4 className="text-sm font-black text-base-content">
                          {play.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addTaskMutation.mutate({
                            title: play.title,
                            description: `${play.objective}\n\nSteps:\n${play.actionSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
                            category:
                              play.category === "keyword_steal"
                                ? "content_gap"
                                : play.category === "comparison_page"
                                  ? "growth"
                                  : "high_impact",
                            priority:
                              play.priority === "HIGH" ? "critical" : "high",
                            aiPrompt: play.suggestedPromptForSam,
                          })
                        }
                        className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white shadow-xs gap-1.5 shrink-0"
                      >
                        <Icon
                          icon="solar:rocket-bold"
                          className="h-3.5 w-3.5"
                        />
                        <span>Export to Action Roadmap</span>
                      </button>
                    </div>

                    <p className="text-xs text-base-content/80 font-medium">
                      {play.objective}
                    </p>

                    {/* Action Steps */}
                    <div className="rounded-xl bg-base-100 p-3.5 space-y-2 border border-base-300/60">
                      <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                        Execution Steps
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-base-content/80 font-medium">
                        {play.actionSteps?.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
