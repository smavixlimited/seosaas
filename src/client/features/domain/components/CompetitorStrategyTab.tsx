import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  getCompetitorStrategy,
  regenerateCompetitorStrategy,
} from "@/serverFunctions/competitor-strategy";
import type {
  CompetitorStrategyTeardown,
  AttackPlayItem,
} from "@/services/competitor-strategy.service";

interface CompetitorStrategyTabProps {
  projectId: string;
  domain: string;
  locationCode?: number;
}

export function CompetitorStrategyTab({
  projectId,
  domain,
  locationCode = 2840,
}: CompetitorStrategyTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const strategyQuery = useQuery({
    queryKey: ["competitorStrategy", projectId, domain, locationCode],
    queryFn: () =>
      getCompetitorStrategy({
        data: {
          domain,
          locationCode,
        },
      }),
    staleTime: 30 * 60 * 1000,
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      regenerateCompetitorStrategy({
        data: {
          domain,
          locationCode,
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["competitorStrategy", projectId, domain, locationCode],
        data,
      );
      toast.success(`Fresh 5-Pillar Strategy decoded for ${domain}!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate strategy analysis");
    },
  });

  const handleExecuteWithSam = (play: AttackPlayItem) => {
    // Store in session storage so SAM chat can grab and execute
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sam_pending_prompt", play.suggestedPromptForSam);
    }

    toast.success(`Strategy play loaded! Launching SAM AI...`);

    void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: {
        s: undefined,
      },
    });
  };

  const report = strategyQuery.data as CompetitorStrategyTeardown | undefined;
  const isLoading = strategyQuery.isLoading || regenerateMutation.isPending;

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <Icon
            icon="solar:shield-check-bold-duotone"
            className="h-6 w-6 animate-spin"
          />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Decoding Competitor Strategy for {domain}...
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Analyzing organic keyword clusters, commercial search intent,
            content moats, and conversion friction to construct your 5-Pillar
            Battle Plan.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
          <Icon icon="solar:shield-warning-bold-duotone" className="h-6 w-6" />
        </div>
        <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">
          Strategy Analysis Unavailable
        </h5>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Could not construct competitor intelligence for {domain}.
        </p>
        <button
          type="button"
          onClick={() => regenerateMutation.mutate()}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-1.5"
        >
          <Icon icon="solar:refresh-circle-bold" className="h-4 w-4" />
          <span>Generate Analysis</span>
        </button>
      </div>
    );
  }

  const {
    positioning,
    funnelAngles,
    contentMoat,
    vulnerabilities,
    attackPlaybook,
    rawMetricsSummary,
  } = report;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-150">
      {/* Overview & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              Competitor Strategy Decoder
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: {domain}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
            5-Pillar Competitive Teardown &amp; Execution Attack Plan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesized intelligence identifying market positioning, 80/20
            content moats, page-2 vulnerabilities, and actionable attack plays.
          </p>
        </div>

        <button
          type="button"
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isPending}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Icon
            icon="solar:refresh-circle-bold"
            className={`h-4 w-4 text-primary ${regenerateMutation.isPending ? "animate-spin" : ""}`}
          />
          <span>
            {regenerateMutation.isPending ? "Analyzing..." : "Refresh Teardown"}
          </span>
        </button>
      </div>

      {/* Metric Footprint Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 space-y-0.5">
          <span className="text-[11px] text-slate-400 font-medium">
            Est. Monthly Organic Traffic
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {rawMetricsSummary.organicTraffic.toLocaleString()}
          </h4>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 space-y-0.5">
          <span className="text-[11px] text-slate-400 font-medium">
            Ranking Organic Keywords
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {rawMetricsSummary.organicKeywords.toLocaleString()}
          </h4>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 space-y-0.5">
          <span className="text-[11px] text-slate-400 font-medium">
            Total Backlink Equity
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {rawMetricsSummary.backlinks.toLocaleString()}
          </h4>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 space-y-0.5">
          <span className="text-[11px] text-slate-400 font-medium">
            Referring Domains
          </span>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
            {rawMetricsSummary.referringDomains.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* PILLAR 1 & 2: POSITIONING & FUNNEL ANGLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Positioning Stance & Core Hook */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
              <Icon icon="solar:target-bold-duotone" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Pillar 1: Positioning Stance &amp; Core Hook
              </h4>
              <p className="text-[10px] text-slate-400">
                How the competitor frames value and targets buyers.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Value Promise
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                &ldquo;{positioning.coreHook}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">
                  Target Audience
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {positioning.targetAudience}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">
                  Market Stance
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {positioning.marketStance}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                Core Messaging Pillars:
              </span>
              <div className="space-y-1">
                {positioning.messagingStrengths.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    <Icon
                      icon="solar:check-circle-bold-duotone"
                      className="h-3.5 w-3.5 text-emerald-500 shrink-0"
                    />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Paid Ads & Funnel Angles */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Icon icon="solar:funnel-bold-duotone" className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Pillar 2: Conversion Angles &amp; Sales Friction
              </h4>
              <p className="text-[10px] text-slate-400">
                Value drivers, offer structures, and buyer friction points.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estimated Funnel Model
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                {funnelAngles.estimatedFunnelType}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                <Icon icon="solar:graph-up-bold" className="h-3.5 w-3.5" />
                <span>Primary Value Drivers (What Sells)</span>
              </span>
              <div className="space-y-1">
                {funnelAngles.primaryValueDrivers.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="h-3.5 w-3.5"
                />
                <span>
                  Pricing &amp; Sales Friction (Where They Are Vulnerable)
                </span>
              </span>
              <div className="space-y-1">
                {funnelAngles.pricingFrictionPoints.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 3: CONTENT MOAT (80/20 RULE) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
            <Icon icon="solar:layers-bold-duotone" className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Pillar 3: Content Moat (80/20 Organic Traffic Rule)
            </h4>
            <p className="text-[10px] text-slate-400">
              The 3 core content clusters generating the vast majority of their
              organic visibility.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/40">
          {contentMoat.contentMoatSummary}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {contentMoat.topThemes.map((theme, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                  {theme.theme}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 font-mono">
                  {theme.trafficSharePct}% Traffic
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">
                  Intent Profile:
                </span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 block">
                  {theme.intentDistribution}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  Core Cluster Terms:
                </span>
                <div className="flex flex-wrap gap-1">
                  {theme.coreKeywords.map((kw, kwIdx) => (
                    <span
                      key={kwIdx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PILLAR 4: VULNERABILITIES & STRIKING-DISTANCE KEYWORDS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
            <Icon
              icon="solar:shield-warning-bold-duotone"
              className="h-5 w-5"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Pillar 4: Strategic Gaps &amp; Striking-Distance Keywords (Ranks
              #11–#30)
            </h4>
            <p className="text-[10px] text-slate-400">
              High-commercial queries where the rival is weak and page 1 is ripe
              for capture.
            </p>
          </div>
        </div>

        {/* Striking Distance Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">High-Value Target Keyword</th>
                <th className="px-3 py-2.5">Competitor Rank</th>
                <th className="px-3 py-2.5">Search Volume</th>
                <th className="px-3 py-2.5">Estimated CPC</th>
                <th className="px-3 py-2.5">Strategic Attack Angle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
              {vulnerabilities.strikingDistanceKeywords.map((k, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30"
                >
                  <td className="px-3 py-2.5 font-bold font-mono text-slate-800 dark:text-slate-100">
                    {k.keyword}
                  </td>
                  <td className="px-3 py-2.5 font-mono">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                      Rank #{k.rank}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono">
                    {k.searchVolume.toLocaleString()} /mo
                  </td>
                  <td className="px-3 py-2.5 font-mono">${k.cpc.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                    {k.gapOpportunity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Content & Technical Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
              <Icon
                icon="solar:document-text-bold-duotone"
                className="h-4 w-4 text-amber-500"
              />
              <span>Identified Content Gaps</span>
            </span>
            <div className="space-y-1">
              {vulnerabilities.contentWeaknesses.map((w, idx) => (
                <p
                  key={idx}
                  className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5"
                >
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
              <Icon
                icon="solar:code-bold-duotone"
                className="h-4 w-4 text-rose-500"
              />
              <span>Technical &amp; AEO Weaknesses</span>
            </span>
            <div className="space-y-1">
              {vulnerabilities.technicalVulnerabilities.map((t, idx) => (
                <p
                  key={idx}
                  className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5"
                >
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{t}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 5: THE ATTACK PLAYBOOK & 1-CLICK SAM AI EXECUTION */}
      <div className="rounded-2xl border-2 border-primary/30 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary text-white shadow-sm">
              <Icon icon="solar:bolt-bold-duotone" className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>
                  Pillar 5: The Attack Playbook (1-Click SAM AI Execution)
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {attackPlaybook.summary}
              </p>
            </div>
          </div>
        </div>

        {/* The 3 Strategic Plays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {attackPlaybook.plays.map((play, idx) => (
            <div
              key={play.id || idx}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 p-4.5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      play.priority === "HIGH"
                        ? "bg-rose-500/10 text-rose-600"
                        : play.priority === "QUICK_WIN"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {play.priority === "QUICK_WIN"
                      ? "QUICK WIN"
                      : `${play.priority} PRIORITY`}
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium">
                    Effort: {play.estimatedEffort}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug">
                    Play #{idx + 1}: {play.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {play.objective}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                  <strong>Impact:</strong> {play.potentialImpact}
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Action Steps:
                  </span>
                  {play.actionSteps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                    >
                      <span className="font-bold text-primary shrink-0">
                        {sIdx + 1}.
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click SAM AI Execution Button */}
              <button
                type="button"
                onClick={() => handleExecuteWithSam(play)}
                className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Icon icon="solar:bolt-circle-bold" className="h-4 w-4" />
                <span>Execute with SAM AI</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
