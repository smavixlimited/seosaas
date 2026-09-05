import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

interface ScanResult {
  domain: string;
  healthScore: number;
  monthlyLostTraffic: number;
  estimatedRevenueLeak: number;
  aiCitationShare: number;
  criticalIssues: Array<{
    title: string;
    impact: string;
    severity: "critical" | "warning" | "opportunity";
  }>;
  topKeywordGaps: Array<{
    keyword: string;
    volume: string;
    diff: string;
    cpc: string;
  }>;
}

const PRESET_DATA: Record<string, ScanResult> = {
  "saas-sample.com": {
    domain: "saas-sample.com",
    healthScore: 74,
    monthlyLostTraffic: 14200,
    estimatedRevenueLeak: 18400,
    aiCitationShare: 18,
    criticalIssues: [
      {
        title: "Missing Structured Data on 18 Pricing & Feature Pages",
        impact: "Blocks AI Overview summary boxes",
        severity: "critical",
      },
      {
        title: "Cannibalizing 'B2B CRM software' with 3 duplicate URLs",
        impact: "Splits PageRank between duplicate landing pages",
        severity: "critical",
      },
      {
        title: "24 Slow LCP (>3.4s) Assets on Core Product Tour",
        impact: "Reduces mobile ranking score",
        severity: "warning",
      },
    ],
    topKeywordGaps: [
      {
        keyword: "best ai sales assistant",
        volume: "9,900/mo",
        diff: "KD 28 (Easy)",
        cpc: "$4.80",
      },
      {
        keyword: "automated pipeline reporting",
        volume: "4,400/mo",
        diff: "KD 32 (Easy)",
        cpc: "$6.20",
      },
      {
        keyword: "enterprise crm integrations",
        volume: "3,100/mo",
        diff: "KD 41 (Med)",
        cpc: "$8.50",
      },
    ],
  },
  "ecommerce-store.com": {
    domain: "ecommerce-store.com",
    healthScore: 68,
    monthlyLostTraffic: 32400,
    estimatedRevenueLeak: 46800,
    aiCitationShare: 9,
    criticalIssues: [
      {
        title: "Missing Product & AggregateRating Schema on 140 Items",
        impact: "Zero rich snippets appearing in Google Shopping",
        severity: "critical",
      },
      {
        title: "Faceted Navigation Creating 1,200 Index Bloat URLs",
        impact: "Diluting crawl budget on filtered variants",
        severity: "critical",
      },
      {
        title: "Broken Internal Links in Mobile Navigation Menu",
        impact: "Traps search engine bots on collection pages",
        severity: "warning",
      },
    ],
    topKeywordGaps: [
      {
        keyword: "organic cotton hoodies",
        volume: "22,000/mo",
        diff: "KD 34 (Easy)",
        cpc: "$1.40",
      },
      {
        keyword: "sustainable gym clothes",
        volume: "14,500/mo",
        diff: "KD 39 (Med)",
        cpc: "$2.10",
      },
      {
        keyword: "eco friendly athletic wear",
        volume: "8,800/mo",
        diff: "KD 29 (Easy)",
        cpc: "$1.90",
      },
    ],
  },
  "local-agency.com": {
    domain: "local-agency.com",
    healthScore: 82,
    monthlyLostTraffic: 6100,
    estimatedRevenueLeak: 12200,
    aiCitationShare: 34,
    criticalIssues: [
      {
        title: "NAP Inconsistency across 14 Top Local Citation Directories",
        impact: "Reduces Google Maps Local 3-Pack rankings",
        severity: "critical",
      },
      {
        title: "Missing LocalBusiness Schema & Geo Coordinates",
        impact: "Hurts near-me voice search accuracy",
        severity: "warning",
      },
      {
        title: "Unoptimized Service Sub-Pages for Neighboring Cities",
        impact: "Missing 1,800 monthly local service searches",
        severity: "opportunity",
      },
    ],
    topKeywordGaps: [
      {
        keyword: "local seo agency near me",
        volume: "6,600/mo",
        diff: "KD 24 (Easy)",
        cpc: "$14.20",
      },
      {
        keyword: "google maps ranking service",
        volume: "3,200/mo",
        diff: "KD 22 (Easy)",
        cpc: "$11.50",
      },
      {
        keyword: "b2b lead generation agency",
        volume: "2,400/mo",
        diff: "KD 38 (Med)",
        cpc: "$16.80",
      },
    ],
  },
};

export function HeroInteractiveScanner() {
  const [domainInput, setDomainInput] = useState("saas-sample.com");
  const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "citations">(
    "overview",
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(
    PRESET_DATA["saas-sample.com"],
  );

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    setIsScanning(true);
    setTimeout(() => {
      const cleanDomain = domainInput
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .toLowerCase();
      if (PRESET_DATA[cleanDomain]) {
        setScanResult(PRESET_DATA[cleanDomain]);
      } else {
        // Generate realistic dynamic metrics for custom entered domain
        const hash = cleanDomain
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const health = 65 + (hash % 26);
        const lostTraffic = 5000 + (hash % 35000);
        const revenueLeak = Math.round(lostTraffic * 1.35);
        const aiCitation = 10 + (hash % 30);

        setScanResult({
          domain: cleanDomain,
          healthScore: health,
          monthlyLostTraffic: lostTraffic,
          estimatedRevenueLeak: revenueLeak,
          aiCitationShare: aiCitation,
          criticalIssues: [
            {
              title: `Unoptimized title tags & missing schema across ${cleanDomain}`,
              impact: "Missing rich AI snippets & SERP highlights",
              severity: "critical",
            },
            {
              title: "32 Orphaned product/landing pages with 0 internal links",
              impact: "Crawl bot efficiency reduced by 44%",
              severity: "critical",
            },
            {
              title:
                "Mobile page speed score below Google's 85 recommended threshold",
              impact: "Core Web Vitals penalty on mobile devices",
              severity: "warning",
            },
          ],
          topKeywordGaps: [
            {
              keyword: `best ${cleanDomain.split(".")[0]} tools`,
              volume: "8,400/mo",
              diff: "KD 29 (Easy)",
              cpc: "$5.40",
            },
            {
              keyword: `${cleanDomain.split(".")[0]} software comparison`,
              volume: "4,200/mo",
              diff: "KD 31 (Easy)",
              cpc: "$7.20",
            },
            {
              keyword: "automated audit software",
              volume: "3,800/mo",
              diff: "KD 36 (Med)",
              cpc: "$9.10",
            },
          ],
        });
      }
      setIsScanning(false);
    }, 600);
  };

  const handlePresetClick = (presetDomain: string) => {
    setDomainInput(presetDomain);
    setScanResult(PRESET_DATA[presetDomain]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[28px] border border-stroke-3/80 bg-white dark:bg-background-6 shadow-2xl overflow-hidden transition-all">
      {/* Header / Interactive Scan Input */}
      <div className="p-4 sm:p-6 border-b border-stroke-3/60 bg-background-2/70 dark:bg-secondary/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary/70 dark:text-accent/70">
              Live Interactive Sandbox • No Account Required
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-brand-300">
            <Icon icon="solar:bolt-bold" className="h-4 w-4" />
            <span>
              Analyzing:{" "}
              <strong className="underline">{scanResult.domain}</strong>
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Icon
              icon="solar:global-bold-duotone"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary/40 dark:text-accent/40"
            />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter any domain (e.g. stripe.com or yoursite.com)..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-stroke-3 bg-white dark:bg-secondary text-sm font-medium text-secondary dark:text-accent placeholder:text-secondary/40 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="btn btn-primary h-12 px-6 rounded-xl font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 shrink-0"
          >
            {isScanning ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Run Instant Scan</span>
                <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs text-secondary/70 dark:text-accent/70">
          <span className="font-semibold text-secondary/50 dark:text-accent/50 shrink-0 mr-1">
            Presets:
          </span>
          {[
            { label: "SaaS", key: "saas-sample.com" },
            { label: "E-Commerce", key: "ecommerce-store.com" },
            { label: "Local Agency", key: "local-agency.com" },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePresetClick(preset.key)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap ${
                domainInput === preset.key
                  ? "bg-primary/10 border-primary text-primary dark:text-brand-300"
                  : "border-stroke-3 bg-white dark:bg-secondary/60 hover:border-primary/50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Interactive Results Container */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Scorecards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-secondary/60 dark:text-accent/60 uppercase tracking-wider">
                SEO Health Score
              </span>
              <Icon
                icon="solar:shield-check-bold"
                className="h-4 w-4 text-emerald-500"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-500">
                {scanResult.healthScore}
              </span>
              <span className="text-xs font-bold text-secondary/40 dark:text-accent/40">
                / 100
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {scanResult.healthScore >= 80
                ? "Solid foundation"
                : "High optimization headroom"}
            </div>
          </div>

          <div className="rounded-2xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-secondary/60 dark:text-accent/60 uppercase tracking-wider">
                Lost Traffic / Mo
              </span>
              <Icon
                icon="solar:graph-down-bold"
                className="h-4 w-4 text-rose-500"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-500">
                {scanResult.monthlyLostTraffic.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-secondary/40 dark:text-accent/40">
                visits
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              Trapped in positions 11-20
            </div>
          </div>

          <div className="rounded-2xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-secondary/60 dark:text-accent/60 uppercase tracking-wider">
                Est. Monthly Leak
              </span>
              <Icon
                icon="solar:dollar-bold"
                className="h-4 w-4 text-amber-500"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                ${scanResult.estimatedRevenueLeak.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-secondary/40 dark:text-accent/40">
                / mo
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Recoverable via Top 3 rank
            </div>
          </div>

          <div className="rounded-2xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-secondary/60 dark:text-accent/60 uppercase tracking-wider">
                AEO Citation Share
              </span>
              <Icon
                icon="solar:stars-bold"
                className="h-4 w-4 text-primary dark:text-brand-300"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-primary dark:text-brand-300">
                {scanResult.aiCitationShare}%
              </span>
              <span className="text-xs font-bold text-secondary/40 dark:text-accent/40">
                in AI SERPs
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-primary/80 dark:text-brand-300/80">
              ChatGPT & Perplexity
            </div>
          </div>
        </div>

        {/* Interactive Sub-Tabs */}
        <div className="border border-stroke-3/60 rounded-2xl overflow-hidden bg-white dark:bg-secondary/40">
          <div className="flex border-b border-stroke-3/60 bg-background-2/60 dark:bg-secondary/60 overflow-x-auto">
            {[
              {
                id: "overview",
                label: "Prioritized Fixes",
                icon: "solar:checklist-bold",
              },
              {
                id: "gaps",
                label: "Top Keyword Gaps",
                icon: "solar:target-bold",
              },
              {
                id: "citations",
                label: "AI Search Radar",
                icon: "solar:radar-bold",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary dark:text-brand-300 bg-white dark:bg-secondary"
                    : "border-transparent text-secondary/70 dark:text-accent/70 hover:text-secondary dark:hover:text-accent"
                }`}
              >
                <Icon icon={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "overview" && (
              <div className="space-y-3">
                {scanResult.criticalIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-stroke-3/50 bg-background-2/30 dark:bg-secondary/20"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`badge badge-sm mt-0.5 font-bold ${
                          issue.severity === "critical"
                            ? "bg-rose-500 text-white"
                            : issue.severity === "warning"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-500 text-white"
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-secondary dark:text-accent">
                        {issue.title}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary dark:text-brand-300 shrink-0 sm:text-right">
                      {issue.impact}
                    </span>
                  </div>
                ))}

                {/* Frosted Gated Preview of Additional 48 Issues */}
                <div className="relative mt-4 pt-4 border-t border-stroke-3/40 rounded-xl overflow-hidden">
                  <div className="opacity-35 blur-[1.5px] pointer-events-none space-y-2 select-none">
                    <div className="p-3 rounded-xl border border-stroke-3 bg-background-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-secondary">
                        H1 tag hierarchy missing on 14 product category archives
                      </span>
                      <span className="text-xs font-bold text-rose-500">
                        Critical Crawl Issue
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-stroke-3 bg-background-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-secondary">
                        Canonical URL loop detected across multi-currency
                        variants
                      </span>
                      <span className="text-xs font-bold text-amber-500">
                        Indexation Bleed
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-secondary/70 backdrop-blur-[2px] p-3 text-center rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-secondary dark:text-accent mb-1">
                      <Icon
                        icon="solar:lock-bold"
                        className="size-4 text-primary dark:text-brand-300"
                      />
                      <span>+48 More Issues & Gaps Discovered</span>
                    </div>
                    <Link
                      to="/sign-up"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-brand-300 hover:underline"
                    >
                      <span>Unlock full 50-page breakdown free</span>
                      <Icon
                        icon="solar:arrow-right-linear"
                        className="size-3.5"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gaps" && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full text-xs">
                    <thead>
                      <tr className="border-b border-stroke-3/60 text-secondary/60 dark:text-accent/60">
                        <th>Untapped Keyword</th>
                        <th>Search Volume</th>
                        <th>Ranking Difficulty</th>
                        <th>Avg. CPC</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanResult.topKeywordGaps.map((gap, idx) => (
                        <tr key={idx} className="border-b border-stroke-3/30">
                          <td className="font-bold text-secondary dark:text-accent">
                            {gap.keyword}
                          </td>
                          <td className="font-semibold text-secondary/80 dark:text-accent/80">
                            {gap.volume}
                          </td>
                          <td>
                            <span className="badge badge-sm border border-emerald-500/30 bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                              {gap.diff}
                            </span>
                          </td>
                          <td className="font-semibold text-secondary/80 dark:text-accent/80">
                            {gap.cpc}
                          </td>
                          <td>
                            <Link
                              to="/sign-up"
                              className="btn btn-ghost btn-xs text-primary dark:text-brand-300 font-bold hover:bg-primary/10 gap-1"
                            >
                              <span>Target</span>
                              <Icon
                                icon="solar:arrow-right-linear"
                                className="h-3 w-3"
                              />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Frosted Gated Preview for Keywords */}
                <div className="relative pt-3 border-t border-stroke-3/40 rounded-xl overflow-hidden">
                  <div className="opacity-35 blur-[1.5px] pointer-events-none select-none text-xs space-y-1">
                    <div className="p-2 border border-stroke-3 rounded flex justify-between">
                      <span>ai pipeline tracking system</span>
                      <span>18,200/mo • KD 24</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-secondary/70 backdrop-blur-[2px] p-2 text-center rounded-xl">
                    <Link
                      to="/sign-up"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-brand-300 hover:underline"
                    >
                      <Icon
                        icon="solar:lock-bold"
                        className="size-3.5 text-primary dark:text-brand-300"
                      />
                      <span>+142 More Low-Hanging Keyword Opportunities</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "citations" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary dark:text-brand-300">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="solar:shield-warning-bold"
                      className="h-4 w-4"
                    />
                    <span>
                      Perplexity, ChatGPT & Claude currently cite 3 of your
                      competitors for commercial buying queries.
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 text-center">
                    <div className="font-bold text-secondary/60 dark:text-accent/60">
                      Perplexity AI
                    </div>
                    <div className="text-lg font-black text-rose-500 mt-1">
                      Not Cited
                    </div>
                    <div className="text-[10px] text-secondary/50 dark:text-accent/50 mt-0.5">
                      Competitors taking 100% share
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 text-center">
                    <div className="font-bold text-secondary/60 dark:text-accent/60">
                      ChatGPT Search
                    </div>
                    <div className="text-lg font-black text-amber-500 mt-1">
                      1 Citation
                    </div>
                    <div className="text-[10px] text-secondary/50 dark:text-accent/50 mt-0.5">
                      Brand mention only
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-stroke-3/60 bg-background-2/40 dark:bg-secondary/30 text-center">
                    <div className="font-bold text-secondary/60 dark:text-accent/60">
                      Claude Recommendations
                    </div>
                    <div className="text-lg font-black text-emerald-500 mt-1">
                      2 Citations
                    </div>
                    <div className="text-[10px] text-secondary/50 dark:text-accent/50 mt-0.5">
                      Solid technical presence
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Natural Late Conversion Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-brand-300/10 border border-primary/20">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-tagline-1 font-bold text-secondary dark:text-accent">
              See Full 50-Page Audit & Track Daily Rankings
            </h4>
            <p className="text-tagline-3 text-secondary/70 dark:text-accent/70">
              Get competitor ad spy access, real-time rank tracking, and weekly
              PDF client reports.
            </p>
          </div>
          <Link
            to="/sign-up"
            className="btn btn-primary btn-sm rounded-full font-bold text-white shadow-md shadow-primary/25 border-none px-6 shrink-0 gap-1.5 h-10"
          >
            <span>Claim Free Account</span>
            <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
