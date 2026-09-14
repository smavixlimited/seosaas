import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  getAdvancedAnalyticsOverview,
  exportAdvancedAnalyticsCsv,
} from "@/serverFunctions/advanced-analytics";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import { BRAND_CONFIG } from "@/config/brand";
import type {
  AnalyticsDateRange,
  AdvancedAnalyticsReport,
  StrategicRecommendationItem,
} from "@/services/advanced-analytics.service";

interface AdvancedAnalyticsPageProps {
  projectId: string;
}

export function AdvancedAnalyticsPage({
  projectId,
}: AdvancedAnalyticsPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = React.useState<AnalyticsDateRange>("30d");

  const analyticsQuery = useQuery<AdvancedAnalyticsReport>({
    queryKey: ["advancedAnalytics", projectId, dateRange],
    queryFn: () =>
      getAdvancedAnalyticsOverview({
        data: { projectId, dateRange },
      }),
    staleTime: 5 * 60 * 1000,
  });

  const report = analyticsQuery.data;

  const exportCsvMutation = useMutation({
    mutationFn: () =>
      exportAdvancedAnalyticsCsv({
        data: { projectId, dateRange },
      }),
    onSuccess: (data) => {
      const blob = new Blob([data.csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Executive CSV export downloaded!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to export CSV");
    },
  });

  const addToRoadmapMutation = useMutation({
    mutationFn: (rec: StrategicRecommendationItem) =>
      createRoadmapTask({
        data: {
          projectId,
          title: rec.title,
          description: `Impact: ${rec.impactValue} (Effort: ${rec.effort})`,
          category:
            rec.category === "high_impact"
              ? "high_impact"
              : rec.category === "quick_win"
                ? "quick_win"
                : "growth",
          priority: rec.category === "high_impact" ? "critical" : "high",
          aiPrompt: rec.suggestedPrompt,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Added recommendation to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add to roadmap");
    },
  });

  const handleLaunchSam = (prompt: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sam_pending_prompt", prompt);
    }
    toast.success("Opening Skorvia AI with optimization context...");
    void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: { s: undefined },
    });
  };

  const handlePrintPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const distributionChartData = React.useMemo(() => {
    if (!report) return [];
    return [
      {
        tier: "Top 3",
        count: report.rankingDistribution.top3,
        fill: "#10b981",
      },
      {
        tier: "4 - 10",
        count: report.rankingDistribution.top10,
        fill: "#3b82f6",
      },
      {
        tier: "11 - 20",
        count: report.rankingDistribution.top20,
        fill: "#6366f1",
      },
      {
        tier: "21 - 50",
        count: report.rankingDistribution.top50,
        fill: "#f59e0b",
      },
      {
        tier: "51 - 100",
        count: report.rankingDistribution.top100,
        fill: "#8b5cf6",
      },
      {
        tier: "Not Ranked",
        count: report.rankingDistribution.notRanking,
        fill: "#64748b",
      },
    ];
  }, [report]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* PROFESSIONAL PRINT / PDF EXPORT STYLING */}
      <style>{`
        @media print {
          @page {
            margin: 1.2cm;
            size: A4 portrait;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:flex {
            display: flex !important;
          }
          .print\\:block {
            display: block !important;
          }
          .card {
            border: 1px solid #e2e8f0 !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            break-inside: avoid !important;
          }
          table {
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* DEDICATED PRINT / PDF HEADER (Visible only in Print / PDF export) */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={BRAND_CONFIG.logoUrl}
            alt={BRAND_CONFIG.name}
            className="h-10 w-10 object-contain rounded-lg border border-slate-200"
          />
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">
              {BRAND_CONFIG.name.toUpperCase()}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              {BRAND_CONFIG.slogan}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-black uppercase tracking-wider text-slate-900">
            Executive Growth &amp; SEO Report
          </div>
          <div className="text-xs font-semibold text-slate-700 font-mono">
            {report?.domain || "Target Property"}
          </div>
          <div className="text-[10px] text-slate-500">
            Period: {dateRange.toUpperCase()} · Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* On-Screen Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-base-300 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-xs uppercase tracking-wider">
              Executive Analytics
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              {report?.domain || "yourbrand.com"}
            </span>
            {report?.isGscConnected ? (
              <span className="badge badge-success badge-outline badge-xs gap-1">
                <Icon icon="icon-park-outline:check-one" className="w-3 h-3" />{" "}
                GSC Live: {report.gscSiteUrl}
              </span>
            ) : (
              <span className="badge badge-warning badge-outline badge-xs gap-1">
                <Icon icon="icon-park-outline:info" className="w-3 h-3" /> GSC
                Disconnected
              </span>
            )}
            {report?.isGa4Connected && (
              <span className="badge badge-info badge-outline badge-xs gap-1">
                <Icon icon="icon-park-outline:check-one" className="w-3 h-3" />{" "}
                GA4 Live
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            Unified Growth &amp; SEO Command Center
          </h1>
          <p className="text-sm text-base-content/70 mt-0.5">
            Cross-channel visibility correlating search impressions, rank
            movement, organic traffic value ($), and technical health.
          </p>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="join bg-base-200 p-0.5 rounded-lg border border-base-300">
            {(["7d", "30d", "90d", "180d", "365d"] as AnalyticsDateRange[]).map(
              (range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={`join-item btn btn-xs capitalize ${
                    dateRange === range
                      ? "btn-primary font-semibold"
                      : "btn-ghost"
                  }`}
                >
                  {range === "365d" ? "1 Year" : range.toUpperCase()}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => exportCsvMutation.mutate()}
            disabled={exportCsvMutation.isPending || !report}
            className="btn btn-outline btn-sm gap-1.5"
          >
            {exportCsvMutation.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Icon icon="icon-park-outline:download" className="w-4 h-4" />
            )}
            Export CSV
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="btn btn-primary btn-sm gap-1.5 shadow-sm font-semibold"
          >
            <Icon icon="icon-park-outline:printer" className="w-4 h-4" />
            Export / Print PDF
          </button>
        </div>
      </div>

      {analyticsQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm text-base-content/60 animate-pulse">
            Synthesizing cross-channel search metrics, ranking velocity, and
            revenue attribution...
          </p>
        </div>
      ) : report ? (
        <>
          {/* TRUTHFUL ONBOARDING / EMPTY STATE WHEN NO DATA IS CONNECTED YET */}
          {!report.hasAnyData && (
            <div className="card bg-base-100 border border-primary/30 shadow-sm p-6 space-y-4 print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning badge-sm font-bold">
                      Data Sources Pending
                    </span>
                    <h3 className="font-bold text-base text-base-content">
                      No Live Search Data Collected Yet
                    </h3>
                  </div>
                  <p className="text-xs text-base-content/70 max-w-2xl">
                    Connect your Google Search Console account and start
                    tracking keywords to populate real search impressions,
                    position trajectories, and organic revenue equivalent ($).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <Link
                  to="/p/$projectId/search-performance"
                  params={{ projectId }}
                  className="p-4 rounded-2xl bg-base-200/50 border border-base-300 hover:border-primary transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-primary">
                      <Icon icon="logos:google-icon" className="w-4 h-4" />
                      <span>1. Connect Search Console</span>
                    </div>
                    <p className="text-[11px] text-base-content/60">
                      Sync real Google queries, impressions, and CTR directly.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    Connect GSC &rarr;
                  </span>
                </Link>

                <Link
                  to="/p/$projectId/rank-tracking"
                  params={{ projectId }}
                  className="p-4 rounded-2xl bg-base-200/50 border border-base-300 hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-600">
                      <Icon
                        icon="icon-park-outline:ranking"
                        className="w-4 h-4"
                      />
                      <span>2. Add Tracked Keywords</span>
                    </div>
                    <p className="text-[11px] text-base-content/60">
                      Monitor daily SERP movements, Top 3 ranks, and CPC value.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    Open Rank Tracker &rarr;
                  </span>
                </Link>

                <Link
                  to="/p/$projectId/audit"
                  params={{ projectId }}
                  className="p-4 rounded-2xl bg-base-200/50 border border-base-300 hover:border-blue-500 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-blue-600">
                      <Icon
                        icon="icon-park-outline:protect"
                        className="w-4 h-4"
                      />
                      <span>3. Run Technical Site Audit</span>
                    </div>
                    <p className="text-[11px] text-base-content/60">
                      Crawl pages to calculate technical health and Core Web
                      Vitals.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    Run Audit &rarr;
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Executive KPI Hero Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Impressions */}
            <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                  Total Impressions
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon
                    icon="icon-park-outline:preview-open"
                    className="w-4 h-4"
                  />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight">
                  {report.kpis.totalImpressions.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-base-content/60 font-medium">
                  {report.hasGscData ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Icon
                        icon="icon-park-outline:trending-up"
                        className="w-3.5 h-3.5"
                      />
                      Live Search Console Data
                    </span>
                  ) : (
                    <span>Awaiting GSC connection</span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Clicks & CTR */}
            <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                  Organic Clicks &amp; CTR
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Icon icon="icon-park-outline:click" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight flex items-baseline gap-2">
                  <span>{report.kpis.totalClicks.toLocaleString()}</span>
                  {report.kpis.totalImpressions > 0 && (
                    <span className="text-xs font-medium text-base-content/60">
                      ({report.kpis.averageCtr}% CTR)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-base-content/60 font-medium">
                  {report.hasGscData ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Icon
                        icon="icon-park-outline:check-one"
                        className="w-3.5 h-3.5"
                      />
                      Verified Organic Traffic
                    </span>
                  ) : (
                    <span>0 clicks recorded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Traffic Replacement Value */}
            <div className="card bg-gradient-to-br from-emerald-500/10 via-base-100 to-base-100 border border-emerald-500/30 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Est. Organic Value ($/mo)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <Icon icon="icon-park-outline:funds" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  ${report.kpis.estimatedMonthlyTrafficValue.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {report.kpis.estimatedMonthlyTrafficValue > 0 ? (
                    <span>
                      Saves ~$
                      {report.kpis.adSpendSavingsEquivalent.toLocaleString()}/mo
                      vs Google Ads
                    </span>
                  ) : (
                    <span>Calculated from real organic clicks</span>
                  )}
                </div>
              </div>
            </div>

            {/* Average Rank & Technical Health */}
            <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                  Avg Position &amp; Health
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Icon icon="icon-park-outline:ranking" className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight flex items-baseline gap-2">
                  <span>
                    {report.kpis.averagePosition > 0
                      ? `#${report.kpis.averagePosition}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-base-content/60">
                  <span>Health: </span>
                  <span className="font-bold text-emerald-600">
                    {report.kpis.technicalHealthScore > 0
                      ? `${report.kpis.technicalHealthScore}/100`
                      : "Not Scanned"}
                  </span>
                  <span className="mx-1">•</span>
                  <span>Tracked: </span>
                  <span className="font-bold text-indigo-600">
                    {report.kpis.totalTrackedKeywords} KWs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Impression & Click Trajectory Chart */}
            <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Icon
                      icon="icon-park-outline:chart-line"
                      className="w-4 h-4 text-primary"
                    />
                    Organic Traffic &amp; Search Impression Trajectory
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Daily search impression volume and organic click velocity
                    across selected time window.
                  </p>
                </div>
                {report.timeSeriesTrends.length > 0 && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span>Impressions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Clicks</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-64 w-full pt-2">
                {report.timeSeriesTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={report.timeSeriesTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorImp"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorClicks"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        opacity={0.1}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#888" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#888" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorImp)"
                        name="Impressions"
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClicks)"
                        name="Clicks"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-base-300 rounded-xl p-6 text-center space-y-2">
                    <Icon
                      icon="icon-park-outline:chart-line"
                      className="w-8 h-8 text-base-content/30"
                    />
                    <p className="text-xs font-semibold text-base-content/70">
                      No Search Console impression trajectory recorded yet
                    </p>
                    <p className="text-[11px] text-base-content/50 max-w-md">
                      Connect your Google Search Console property to stream
                      daily impressions, clicks, and rank movements.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Keyword Ranking Distribution Matrix */}
            <div className="card bg-base-100 border border-base-300 shadow-sm p-5 space-y-4">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Icon
                    icon="icon-park-outline:ranking"
                    className="w-4 h-4 text-emerald-500"
                  />
                  Ranking Position Matrix
                </h3>
                <p className="text-xs text-base-content/60">
                  Distribution of {report.kpis.totalTrackedKeywords} tracked
                  keywords across Google SERP positions.
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                {report.kpis.totalTrackedKeywords > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={distributionChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        opacity={0.08}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#888" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="tier"
                        type="category"
                        tick={{ fontSize: 11, fill: "#888" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        name="Keywords"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-base-300 rounded-xl p-6 text-center space-y-2">
                    <Icon
                      icon="icon-park-outline:ranking"
                      className="w-8 h-8 text-base-content/30"
                    />
                    <p className="text-xs font-semibold text-base-content/70">
                      0 keywords tracked in Rank Tracker
                    </p>
                    <p className="text-[11px] text-base-content/50 max-w-xs">
                      Add your target keywords in Rank Tracker to view SERP
                      distribution across Top 3, Top 10, and Top 50.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* High-Value Commercial Keywords Table */}
          <div className="card bg-base-100 border border-base-300 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Icon
                    icon="icon-park-outline:funds"
                    className="w-4 h-4 text-emerald-500"
                  />
                  Top Search Queries &amp; Tracked Keywords
                </h3>
                <p className="text-xs text-base-content/60">
                  Real ranking positions and search clicks from Google Search
                  Console and Rank Tracker.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {report.topPerformingKeywords.length > 0 ? (
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-300 text-xs text-base-content/60">
                      <th>Target Query / Keyword</th>
                      <th>Current Position</th>
                      <th>Search Volume / Imp.</th>
                      <th>Est. CPC</th>
                      <th>Monthly Value ($)</th>
                      <th>Intent</th>
                      <th className="text-right print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300/40 text-xs">
                    {report.topPerformingKeywords.map((kw) => (
                      <tr
                        key={kw.id}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        <td className="font-semibold text-base-content">
                          <span className="truncate max-w-xs">
                            {kw.keyword}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-sm font-bold bg-base-200">
                            #{kw.position}
                          </span>
                        </td>
                        <td className="font-mono">
                          {kw.searchVolume.toLocaleString()}
                        </td>
                        <td className="font-mono text-emerald-600 font-medium">
                          ${kw.estimatedCpc.toFixed(2)}
                        </td>
                        <td className="font-mono font-bold text-emerald-600">
                          ${kw.monthlyTrafficValue.toLocaleString()}
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-xs uppercase font-medium">
                            {kw.intent}
                          </span>
                        </td>
                        <td className="text-right print:hidden">
                          <button
                            type="button"
                            onClick={() =>
                              handleLaunchSam(
                                `Act as a senior SEO specialist. Analyze our ranking for keyword "${kw.keyword}" on ${report.domain}. Current rank is #${kw.position}. Provide step-by-step optimization recommendations to push this keyword to #1.`,
                              )
                            }
                            className="btn btn-ghost btn-xs text-primary gap-1"
                          >
                            <Icon
                              icon="icon-park-outline:magic"
                              className="w-3.5 h-3.5"
                            />
                            Optimize
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 border border-dashed border-base-300 rounded-xl text-center space-y-2">
                  <Icon
                    icon="icon-park-outline:search"
                    className="w-8 h-8 text-base-content/30 mx-auto"
                  />
                  <p className="text-xs font-semibold text-base-content/70">
                    No Search Console queries or tracked keywords recorded yet
                  </p>
                  <p className="text-[11px] text-base-content/50 max-w-sm mx-auto">
                    Connect Search Console or add keywords in Rank Tracker to
                    see live search positions and traffic value.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DEDICATED PRINT / PDF FOOTER */}
          <div className="hidden print:flex items-center justify-between border-t border-slate-300 pt-3 text-[10px] text-slate-500 font-mono">
            <span>Prepared by Skorvia Intelligence (skorvia.com)</span>
            <span>Confidential Executive SEO Summary for {report.domain}</span>
          </div>
        </>
      ) : (
        <div className="alert alert-error text-sm">
          Failed to load analytics data. Please try again.
        </div>
      )}
    </div>
  );
}
