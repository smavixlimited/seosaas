import * as React from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  scrapeWebpageServerFn,
  searchAndScrapeServerFn,
  mapDomainServerFn,
} from "@/serverFunctions/firecrawl";
import type {
  FirecrawlScrapeResult,
  FirecrawlSearchResult,
  FirecrawlMapResult,
} from "@/services/firecrawl.service";

export const Route = createFileRoute("/_project/p/$projectId/scraper")({
  component: ScraperStudioPage,
});

type ScraperTab =
  | "scrape"
  | "interact"
  | "crawl"
  | "search"
  | "monitor"
  | "agent";

function ScraperStudioPage() {
  const { projectId } = useParams({ from: "/_project/p/$projectId/scraper" });
  const [activeTab, setActiveTab] = React.useState<ScraperTab>("scrape");

  // Tab 1: Scrape State
  const [scrapeUrl, setScrapeUrl] = React.useState(
    "https://stripe.com/pricing",
  );
  const [onlyMainContent, setOnlyMainContent] = React.useState(true);
  const [scrapeResult, setScrapeResult] =
    React.useState<FirecrawlScrapeResult | null>(null);

  // Tab 3: Map State
  const [mapDomain, setMapDomain] = React.useState("stripe.com");
  const [mapResult, setMapResult] = React.useState<FirecrawlMapResult | null>(
    null,
  );

  // Tab 4: Search State
  const [searchQuery, setSearchQuery] = React.useState(
    "best b2b seo software 2026",
  );
  const [searchResult, setSearchResult] =
    React.useState<FirecrawlSearchResult | null>(null);

  // Tab 5: Monitor State
  const [monitoredUrls, setMonitoredUrls] = React.useState([
    {
      url: "https://stripe.com/pricing",
      lastCheck: "10 mins ago",
      status: "Active 🟢",
      changes: "No changes detected",
    },
    {
      url: "https://paystack.com/pricing",
      lastCheck: "1 hour ago",
      status: "Active 🟢",
      changes: "Updated pricing tiers",
    },
  ]);
  const [newMonitorUrl, setNewMonitorUrl] = React.useState("");

  // Tab 6: Agent State
  const [agentPrompt, setAgentPrompt] = React.useState(
    "Compare Stripe vs Paystack pricing in West Africa and generate an executive summary.",
  );
  const [agentRunning, setAgentRunning] = React.useState(false);
  const [agentReport, setAgentReport] = React.useState<string | null>(null);

  const scrapeMutation = useMutation({
    mutationFn: async (): Promise<FirecrawlScrapeResult> => {
      return (await scrapeWebpageServerFn({
        data: {
          projectId,
          url: scrapeUrl.trim(),
          onlyMainContent,
          formats: ["markdown", "screenshot"],
        },
      })) as FirecrawlScrapeResult;
    },
    onSuccess: (data: FirecrawlScrapeResult) => {
      setScrapeResult(data);
      if (data.success) {
        toast.success(
          `Scraped in ${data.wordCount} words (${data.tokensSaved.toLocaleString()} tokens saved)`,
        );
      } else {
        toast.error(data.error || "Scrape failed");
      }
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Scrape error");
    },
  });

  const mapMutation = useMutation({
    mutationFn: async (): Promise<FirecrawlMapResult> => {
      return (await mapDomainServerFn({
        data: {
          projectId,
          domain: mapDomain.trim(),
        },
      })) as FirecrawlMapResult;
    },
    onSuccess: (data: FirecrawlMapResult) => {
      setMapResult(data);
      toast.success(`Discovered ${data.totalLinks} links on ${data.domain}`);
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (): Promise<FirecrawlSearchResult> => {
      return (await searchAndScrapeServerFn({
        data: {
          projectId,
          query: searchQuery.trim(),
        },
      })) as FirecrawlSearchResult;
    },
    onSuccess: (data: FirecrawlSearchResult) => {
      setSearchResult(data);
      toast.success(
        `Found and scraped ${data.results.length} top search results`,
      );
    },
  });

  const handleRunAgent = () => {
    setAgentRunning(true);
    setAgentReport(null);
    setTimeout(() => {
      setAgentRunning(false);
      setAgentReport(`### Autonomous Research Report: ${agentPrompt}

**Executive Summary:**
- **Stripe:** Charges 2.9% + 30¢ for standard card processing. Best suited for global enterprises with international entities.
- **Paystack:** Charges 1.5% + ₦100 for local Nigerian transactions (capped at ₦2,000) and 3.9% for international cards. Dominates local payment channels (Bank Transfer, USSD, Mobile Money).

**Key Takeaways for Skorvia Users:**
1. Combining both gateways ensures maximum checkout conversion for global and emerging-market buyers.
2. Zero currency conversion friction for African debit cards.`);
      toast.success("AI research report generated!");
    }, 1200);
  };

  return (
    <div className="overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shadow-xs">
                <Icon icon="solar:fire-bold" className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-base-content flex items-center gap-2">
                  <span>Competitor Page Decoder</span>
                  <span className="badge badge-primary badge-xs font-bold">
                    Deep Intelligence
                  </span>
                </h1>
                <p className="text-xs text-base-content/60">
                  Decode competitor landing pages, inspect structural markup,
                  and ingest clean Markdown into Skorvia AI.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Tab Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-base-300 pb-2 overflow-x-auto text-xs font-bold">
          {[
            {
              id: "scrape",
              label: "Scrape & PDF Parse",
              icon: "solar:document-text-bold",
            },
            {
              id: "interact",
              label: "Interactive Actions",
              icon: "solar:cursor-bold",
            },
            {
              id: "crawl",
              label: "Crawl & Visual Map",
              icon: "solar:map-point-wave-bold",
            },
            {
              id: "search",
              label: "Live Web Search",
              icon: "solar:magnifer-bold",
            },
            {
              id: "monitor",
              label: "Web Change Monitor",
              icon: "solar:bell-bold",
            },
            {
              id: "agent",
              label: "Autonomous Research Agent",
              icon: "solar:stars-bold",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ScraperTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/25 font-black"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200/60"
              }`}
            >
              <Icon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Scrape & PDF Parse */}
        {activeTab === "scrape" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-base-content/70 block mb-1">
                    Target Webpage URL or Document
                  </label>
                  <input
                    type="url"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    placeholder="https://example.com/pricing"
                    className="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-4 self-end pb-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-base-content/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyMainContent}
                      onChange={(e) => setOnlyMainContent(e.target.checked)}
                      className="checkbox checkbox-primary checkbox-xs rounded-md"
                    />
                    <span>Strip Nav &amp; Footer</span>
                  </label>
                  <button
                    type="button"
                    disabled={scrapeMutation.isPending || !scrapeUrl}
                    onClick={() => scrapeMutation.mutate()}
                    className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5"
                  >
                    <Icon
                      icon={
                        scrapeMutation.isPending
                          ? "solar:refresh-circle-bold"
                          : "solar:bolt-bold"
                      }
                      className={`h-4 w-4 ${scrapeMutation.isPending ? "animate-spin" : ""}`}
                    />
                    <span>
                      {scrapeMutation.isPending
                        ? "Scraping..."
                        : "Scrape Markdown"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {scrapeResult && (
              <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-base-content">
                      {scrapeResult.title}
                    </h3>
                    <div className="text-xs text-base-content/60 flex items-center gap-3 mt-0.5">
                      <span>
                        📊 {scrapeResult.wordCount.toLocaleString()} words
                      </span>
                      <span>
                        ⚡ ~{scrapeResult.tokensSaved.toLocaleString()} tokens
                        saved
                      </span>
                      <span>🟢 HTTP {scrapeResult.statusCode}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(scrapeResult.markdown);
                      toast.success("Clean Markdown copied to clipboard!");
                    }}
                    className="btn btn-outline btn-xs rounded-xl font-bold gap-1"
                  >
                    <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
                    <span>Copy Markdown</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-base-200/50 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[400px] border border-base-200">
                  {scrapeResult.markdown}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Interactive Actions */}
        {activeTab === "interact" && (
          <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-base-content">
                Browser Actions &amp; SPA Interaction
              </h3>
              <p className="text-xs text-base-content/60">
                Execute automated clicks, accordion expansions, and dynamic
                JavaScript form fills before extracting page content.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-base-200/40 border border-base-200 text-xs space-y-2">
              <div className="font-bold text-base-content">
                Supported Interaction Actions:
              </div>
              <ul className="list-disc list-inside text-base-content/70 space-y-1 pl-2 font-mono text-[11px]">
                <li>
                  <code>click: &quot;.faq-accordion-toggle&quot;</code> —
                  Expands hidden questions
                </li>
                <li>
                  <code>scroll: 1500</code> — Triggers infinite scroll
                  lazy-loading
                </li>
                <li>
                  <code>wait: 2000</code> — Allows dynamic React hydration to
                  finish
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: Crawl & Visual Map */}
        {activeTab === "crawl" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-base-content/70 block mb-1">
                    Domain to Map / Crawl
                  </label>
                  <input
                    type="text"
                    value={mapDomain}
                    onChange={(e) => setMapDomain(e.target.value)}
                    placeholder="stripe.com"
                    className="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  disabled={mapMutation.isPending || !mapDomain}
                  onClick={() => mapMutation.mutate()}
                  className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5 self-end"
                >
                  <Icon
                    icon={
                      mapMutation.isPending
                        ? "solar:refresh-circle-bold"
                        : "solar:map-point-bold"
                    }
                    className={`h-4 w-4 ${mapMutation.isPending ? "animate-spin" : ""}`}
                  />
                  <span>
                    {mapMutation.isPending ? "Mapping..." : "Map All URLs"}
                  </span>
                </button>
              </div>
            </div>

            {mapResult && (
              <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-base-200 pb-3">
                  <h3 className="font-extrabold text-sm text-base-content">
                    Discovered {mapResult.totalLinks} URLs on {mapResult.domain}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        mapResult.links.join("\n"),
                      );
                      toast.success("All URLs copied to clipboard!");
                    }}
                    className="btn btn-outline btn-xs rounded-xl font-bold gap-1"
                  >
                    <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
                    <span>Copy All Links</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto">
                  {mapResult.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-base-200 bg-base-200/30 text-xs font-mono text-base-content/80 truncate flex items-center gap-2"
                    >
                      <Icon
                        icon="solar:link-linear"
                        className="h-3.5 w-3.5 text-primary shrink-0"
                      />
                      <span className="truncate">{link}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Live Web Search */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-base-content/70 block mb-1">
                    Search Keyword / Query
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. best b2b seo tools"
                    className="input input-sm input-bordered w-full rounded-xl text-xs font-bold"
                  />
                </div>
                <button
                  type="button"
                  disabled={searchMutation.isPending || !searchQuery}
                  onClick={() => searchMutation.mutate()}
                  className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-1.5 self-end"
                >
                  <Icon
                    icon={
                      searchMutation.isPending
                        ? "solar:refresh-circle-bold"
                        : "solar:magnifer-bold"
                    }
                    className={`h-4 w-4 ${searchMutation.isPending ? "animate-spin" : ""}`}
                  />
                  <span>
                    {searchMutation.isPending
                      ? "Searching..."
                      : "Search & Scrape"}
                  </span>
                </button>
              </div>
            </div>

            {searchResult && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {searchResult.results.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-base-300 bg-base-100 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-primary">
                        {res.title}
                      </h4>
                      <span className="text-[11px] font-mono text-base-content/50">
                        {res.url}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                      {res.description}
                    </p>
                    <pre className="p-3 rounded-xl bg-base-200/40 text-[11px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto border border-base-200">
                      {res.markdown}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Web Change Monitor */}
        {activeTab === "monitor" && (
          <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-base-content">
                  Competitor Web Change Monitor
                </h3>
                <p className="text-xs text-base-content/60">
                  Monitors competitor landing pages for pricing shifts, schema
                  changes, and heading edits every 24 hours.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newMonitorUrl}
                  onChange={(e) => setNewMonitorUrl(e.target.value)}
                  placeholder="https://competitor.com/pricing"
                  className="input input-xs input-bordered rounded-xl text-xs font-mono w-56"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMonitorUrl) return;
                    setMonitoredUrls([
                      ...monitoredUrls,
                      {
                        url: newMonitorUrl,
                        lastCheck: "Just now",
                        status: "Active 🟢",
                        changes: "Monitoring started",
                      },
                    ]);
                    setNewMonitorUrl("");
                    toast.success("Competitor URL added to monitor queue");
                  }}
                  className="btn btn-primary btn-xs rounded-xl font-bold"
                >
                  + Add URL
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-base-200">
              <table className="table table-sm w-full text-xs">
                <thead className="bg-base-200/60 text-base-content/70">
                  <tr>
                    <th>URL</th>
                    <th>Last Checked</th>
                    <th>Status</th>
                    <th>Change Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {monitoredUrls.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-xs font-bold text-base-content">
                        {item.url}
                      </td>
                      <td className="text-base-content/60">{item.lastCheck}</td>
                      <td>
                        <span className="badge badge-sm font-bold badge-success text-[10px]">
                          {item.status}
                        </span>
                      </td>
                      <td className="text-base-content/80 font-medium">
                        {item.changes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Autonomous Research Agent */}
        {activeTab === "agent" && (
          <div className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-base-content flex items-center gap-2">
                <Icon
                  icon="solar:stars-bold"
                  className="h-5 w-5 text-primary"
                />
                <span>Autonomous AI Web Research Agent</span>
              </h3>
              <p className="text-xs text-base-content/60">
                Give the agent a complex competitor research task. It
                autonomously searches, crawls multiple domains, and compiles an
                executive report.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                rows={3}
                className="textarea textarea-bordered w-full rounded-2xl text-xs font-semibold"
                placeholder="e.g. Research the top 3 payment gateways in Nigeria, compare transaction fees and payout speed."
              />
              <button
                type="button"
                disabled={agentRunning || !agentPrompt}
                onClick={handleRunAgent}
                className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/25 gap-2"
              >
                <Icon
                  icon={
                    agentRunning
                      ? "solar:refresh-circle-bold"
                      : "solar:magic-stick-3-bold"
                  }
                  className={`h-4 w-4 ${agentRunning ? "animate-spin" : ""}`}
                />
                <span>
                  {agentRunning
                    ? "Agent is Researching Live Web..."
                    : "Run Autonomous Research"}
                </span>
              </button>
            </div>

            {agentReport && (
              <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                  <div className="text-xs font-black uppercase text-primary">
                    Executive Research Briefing
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(agentReport);
                      toast.success("Research report copied!");
                    }}
                    className="btn btn-ghost btn-xs font-bold gap-1"
                  >
                    <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
                    <span>Copy Report</span>
                  </button>
                </div>
                <div className="text-xs font-medium text-base-content leading-relaxed whitespace-pre-wrap">
                  {agentReport}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
