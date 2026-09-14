import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { getTrendingRadar } from "@/serverFunctions/trends-radar";
import { createRoadmapTask } from "@/serverFunctions/roadmap";
import { saveKeywords } from "@/serverFunctions/keywords";
import { BrandSettingsCompletenessReminder } from "@/client/components/BrandSettingsCompletenessReminder";
import type {
  TrendingQueryItem,
  QuestionStem,
  TrendCategory,
} from "@/services/trends-radar.service";

interface TrendsRadarPageProps {
  projectId: string;
}

export function TrendsRadarPage({ projectId }: TrendsRadarPageProps) {
  const queryClient = useQueryClient();
  const [searchTopic, setSearchTopic] = React.useState("");
  const [activeSearch, setActiveSearch] = React.useState<string | undefined>(
    undefined,
  );
  const [categoryFilter, setCategoryFilter] = React.useState<
    "all" | TrendCategory
  >("all");
  const [stemFilter, setStemFilter] = React.useState<"all" | QuestionStem>(
    "all",
  );
  const [selectedBriefItem, setSelectedBriefItem] =
    React.useState<TrendingQueryItem | null>(null);

  const radarQuery = useQuery({
    queryKey: ["trendsRadar", projectId, activeSearch],
    queryFn: () =>
      getTrendingRadar({
        data: {
          projectId,
          customTopic: activeSearch,
        },
      }),
  });

  const saveKeywordMutation = useMutation({
    mutationFn: (item: TrendingQueryItem) =>
      saveKeywords({
        data: {
          projectId,
          keywords: [item.query],
          metrics: [
            {
              keyword: item.query,
              searchVolume: item.searchVolume,
              cpc: item.cpc,
              competition: item.difficulty / 100,
              keywordDifficulty: item.difficulty,
              intent: item.intent,
            },
          ],
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["savedKeywords", projectId],
      });
      toast.success("Saved keyword to Saved Keywords list!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save keyword");
    },
  });

  const addRoadmapMutation = useMutation({
    mutationFn: (item: TrendingQueryItem) =>
      createRoadmapTask({
        data: {
          projectId,
          title: `Create High-Intent Content for: "${item.query}"`,
          description: `Target the trending search query "${item.query}" (${item.searchVolume.toLocaleString()} searches/mo, +${item.growthRatePercent}% growth, ${item.intent} intent).`,
          category: "content_gap",
          priority: item.isBreakout ? "critical" : "high",
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["projectRoadmap", projectId],
      });
      toast.success("Added content creation task to Action Roadmap!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add task to roadmap");
    },
  });

  const radarData = radarQuery.data;
  const items = radarData?.items || [];

  const filteredItems = items.filter((it) => {
    const matchesCategory =
      categoryFilter === "all" || it.category === categoryFilter;
    const matchesStem = stemFilter === "all" || it.stem === stemFilter;
    return matchesCategory && matchesStem;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTopic.trim()) {
      setActiveSearch(undefined);
    } else {
      setActiveSearch(searchTopic.trim());
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const downloadCsv = () => {
    if (filteredItems.length === 0) return;
    const headers =
      "Query,Category,Question Stem,Search Volume,CPC,Difficulty,Intent,Growth Rate\n";
    const rows = filteredItems
      .map(
        (it) =>
          `"${it.query}","${it.category}","${it.stem || ""}","${it.searchVolume}","$${it.cpc}","${it.difficulty}/100","${it.intent}","+${it.growthRatePercent}%"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `trending_questions_${radarData?.seedTopic || "topic"}.csv`,
    );
    link.click();
    toast.success("Downloaded trending queries CSV!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Brand Settings Completeness Reminder */}
      <BrandSettingsCompletenessReminder projectId={projectId} />

      {/* Top Banner Notice */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-base-100 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Icon
              icon="solar:chart-2-bold"
              className="h-7 w-7 text-amber-300"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-base-content">
                Trending Topics &amp; Question Radar
              </h2>
              <span className="badge badge-primary badge-xs font-bold uppercase tracking-wider">
                Search Demand &bull; Questions
              </span>
            </div>

            <p className="text-xs text-base-content/70 mt-0.5">
              Explore real-time search trends, question clusters (Who, What,
              Where, Why, How), and Google Trends breakouts.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 max-w-md w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="Search any niche (e.g., ai agents, seo)..."
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            className="input input-bordered input-sm rounded-xl text-xs w-full sm:w-64 bg-base-100"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs text-white shrink-0"
          >
            Explore
          </button>
        </form>
      </div>

      {/* Top Metric Cards */}
      {radarData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-base-300 bg-base-100 space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                  Active Trend
                </span>
                <span className="badge badge-primary badge-outline badge-xs font-bold">
                  {radarData.targetCountry}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-primary capitalize line-clamp-2">
                {radarData.seedTopic}
              </h3>
              <span className="text-[11px] text-base-content/50 block">
                Niche: {radarData.industry}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-base-300 bg-base-100 space-y-1 shadow-xs">
              <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                Questions Found
              </span>
              <h3 className="text-lg font-black text-base-content font-mono">
                {radarData.totalQuestionsFound}
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold">
                What, How, Why, Can, Are
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-base-300 bg-base-100 space-y-1 shadow-xs">
              <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                Trend Breakouts
              </span>
              <h3 className="text-lg font-black text-rose-600 font-mono">
                {radarData.totalBreakoutsFound} Rising
              </h3>
              <span className="text-[11px] text-base-content/50">
                +300% to +780% Velocity
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-base-300 bg-base-100 space-y-1 shadow-xs flex flex-col justify-between">
              <span className="text-xs text-base-content/60 font-bold uppercase tracking-wider">
                Quick Export
              </span>
              <button
                type="button"
                onClick={downloadCsv}
                disabled={filteredItems.length === 0}
                className="btn btn-outline btn-xs rounded-xl font-bold gap-1 w-fit"
              >
                <Icon
                  icon="solar:download-minimalistic-bold"
                  className="h-3.5 w-3.5"
                />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Trending Market Catalyst / Story Banner */}
          {radarData.trendingStoryContext && (
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Icon icon="solar:fire-bold" className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-warning badge-xs font-black uppercase tracking-wider text-black">
                    🔥 {radarData.trendingStoryContext.catalystType}
                  </span>
                  <span className="text-xs font-black text-base-content">
                    {radarData.trendingStoryContext.headline}
                  </span>
                </div>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {radarData.trendingStoryContext.summary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `All Queries (${items.length})` },
            { id: "questions", label: "Questions (5W1H)" },
            { id: "prepositions", label: "Prepositions (For/With)" },
            { id: "comparisons", label: "Comparisons (Vs/Or)" },
            { id: "breakouts", label: "🔥 Google Trends Breakouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCategoryFilter(tab.id as any);
                if (tab.id !== "questions") setStemFilter("all");
              }}
              className={`btn btn-sm rounded-2xl text-xs font-bold transition-all ${
                categoryFilter === tab.id
                  ? "btn-primary text-white shadow-xs"
                  : "btn-ghost text-base-content/70 hover:text-base-content"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Question Stem Sub-Filter (when category is questions or all) */}
        {(categoryFilter === "all" || categoryFilter === "questions") && (
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-base-content/50 uppercase mr-1">
              Stem:
            </span>
            {["all", "what", "how", "why", "can", "are", "where", "who"].map(
              (stem) => (
                <button
                  key={stem}
                  type="button"
                  onClick={() => setStemFilter(stem as any)}
                  className={`badge badge-sm font-bold capitalize cursor-pointer transition-all ${
                    stemFilter === stem
                      ? "badge-primary text-white"
                      : "badge-ghost text-base-content/60"
                  }`}
                >
                  {stem}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Query Cards Grid */}
      {radarQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-48 rounded-3xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-base-300 bg-base-100 space-y-3">
          <Icon
            icon="solar:magnifer-bold"
            className="h-10 w-10 text-base-content/30 mx-auto"
          />
          <h3 className="text-base font-bold text-base-content">
            No queries found for this filter
          </h3>
          <p className="text-xs text-base-content/60">
            Try switching category tabs or enter a different seed keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl border border-base-300 bg-base-100 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.stem && (
                      <span className="badge badge-primary badge-xs font-black uppercase tracking-wider">
                        {item.stem}
                      </span>
                    )}
                    <span className="badge badge-neutral badge-xs font-mono capitalize">
                      {item.intent}
                    </span>
                  </div>

                  {item.isBreakout ? (
                    <span className="badge badge-error badge-xs font-black text-white gap-1 animate-pulse">
                      🔥 +{item.growthRatePercent}%
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600 font-mono">
                      +{item.growthRatePercent}%
                    </span>
                  )}
                </div>

                {/* Query Title */}
                <h4 className="text-sm font-black text-base-content leading-snug">
                  &ldquo;{item.query}&rdquo;
                </h4>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-base-200/40 border border-base-300/50 text-center font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-base-content/50 block font-sans font-bold">
                      Vol/mo
                    </span>
                    <span className="text-xs font-bold text-base-content">
                      {item.searchVolume.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-base-content/50 block font-sans font-bold">
                      CPC
                    </span>
                    <span className="text-xs font-bold text-base-content">
                      ${item.cpc.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-base-content/50 block font-sans font-bold">
                      KD
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {item.difficulty}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-base-200">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBriefItem(item)}
                    className="btn btn-outline btn-xs rounded-lg font-bold gap-1 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Icon icon="solar:document-text-bold" className="h-3 w-3" />
                    <span>Article Brief</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.query, "Search query")}
                    className="btn btn-ghost btn-xs text-base-content/70 hover:text-base-content rounded-lg font-bold gap-1"
                  >
                    <Icon icon="solar:copy-bold" className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={saveKeywordMutation.isPending}
                    onClick={() => saveKeywordMutation.mutate(item)}
                    className="btn btn-outline btn-xs rounded-lg font-bold gap-1 text-primary border-primary/30 hover:bg-primary hover:text-white"
                  >
                    <Icon icon="solar:bookmark-bold" className="h-3 w-3" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    disabled={addRoadmapMutation.isPending}
                    onClick={() => addRoadmapMutation.mutate(item)}
                    className="btn btn-primary btn-xs rounded-lg font-bold text-white gap-1"
                  >
                    <Icon icon="solar:rocket-bold" className="h-3 w-3" />
                    <span>+ Roadmap</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEO Article Brief Modal */}
      {selectedBriefItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="rounded-3xl bg-base-100 border border-base-300 p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon icon="solar:document-text-bold" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-base-content">
                    SEO Content Brief &amp; Article Blueprint
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Targeting: &ldquo;{selectedBriefItem.query}&rdquo;
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBriefItem(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {/* Keyword Meta Specs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-center">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Search Volume
                </span>
                <span className="text-sm font-black text-primary">
                  {selectedBriefItem.searchVolume.toLocaleString()} /mo
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-center">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Difficulty (KD)
                </span>
                <span className="text-sm font-black text-amber-500">
                  {selectedBriefItem.difficulty}/100
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 text-center">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Search Intent
                </span>
                <span className="text-xs font-black text-base-content uppercase block">
                  {selectedBriefItem.intent}
                </span>
              </div>
            </div>

            {/* Recommended Title & H1 */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">
                Recommended SEO Title &amp; H1:
              </span>
              <p className="text-sm font-black text-base-content leading-snug">
                {selectedBriefItem.query.charAt(0).toUpperCase() +
                  selectedBriefItem.query.slice(1)}
                : Complete Guide &amp; Solutions
              </p>
            </div>

            {/* Structured H2 & Section Blueprint */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-base-content/60 block">
                Recommended H2 Section Outline:
              </span>
              <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 space-y-2.5 font-sans text-xs leading-relaxed text-base-content/90 font-medium">
                <p>
                  <strong>1. Introduction &amp; Core Definition:</strong> Clear,
                  concise direct answer in the first 50 words to win Google AI
                  Overviews and Featured Snippets.
                </p>
                <p>
                  <strong>2. Why This Matters Now:</strong> Address the market
                  shift, pain points, and rising trend demand (+
                  {selectedBriefItem.growthRatePercent}% search velocity).
                </p>
                <p>
                  <strong>3. Step-by-Step Practical Implementation:</strong>{" "}
                  Actionable framework showing readers exactly how to resolve or
                  implement the solution.
                </p>
                <p>
                  <strong>4. Common Mistakes to Avoid:</strong> Highlight
                  pitfalls competitors fail to mention.
                </p>
                <p>
                  <strong>5. Frequently Asked Questions (FAQ Schema):</strong>{" "}
                  Target secondary long-tail question stems for rich snippet
                  coverage.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-base-200">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `SEO Content Brief: "${selectedBriefItem.query}"\nTarget Keyword: ${selectedBriefItem.query}\nSearch Volume: ${selectedBriefItem.searchVolume}/mo\nKeyword Difficulty: ${selectedBriefItem.difficulty}/100\nIntent: ${selectedBriefItem.intent}\n\nH1: ${selectedBriefItem.query}\n\nOutline:\n1. Direct Answer Summary\n2. Why This Matters in 2026\n3. Step-by-Step Action Plan\n4. Common Mistakes & Fixes\n5. FAQ Section`,
                    "SEO Content Brief",
                  )
                }
                className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
              >
                <Icon icon="solar:copy-bold" className="h-4 w-4" />
                <span>Copy Brief</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addRoadmapMutation.mutate(selectedBriefItem);
                  setSelectedBriefItem(null);
                }}
                className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
              >
                <Icon icon="solar:rocket-bold" className="h-4 w-4" />
                <span>Add Brief to Action Roadmap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
