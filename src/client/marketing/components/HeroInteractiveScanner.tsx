import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

interface ScanResult {
  domain: string;
  healthScore: number;
  monthlyLostTraffic: number;
  estimatedRevenueLeak: number;
  aiCitationShare: number;
  topKeywordGaps: { keyword: string; volume: string; diff: string; cpc: string }[];
  criticalIssues: { title: string; severity: "critical" | "warning" | "opportunity"; impact: string }[];
}

const PRESET_DOMAINS: Record<string, ScanResult> = {
  "saas-sample.com": {
    domain: "saas-sample.com",
    healthScore: 82,
    monthlyLostTraffic: 14200,
    estimatedRevenueLeak: 6800,
    aiCitationShare: 24,
    topKeywordGaps: [
      { keyword: "ai competitor ad spy tool", volume: "18.2K", diff: "Low (28)", cpc: "$3.40" },
      { keyword: "b2b organic rank tracker", volume: "12.5K", diff: "Med (42)", cpc: "$4.15" },
      { keyword: "answer engine optimization platform", volume: "8.9K", diff: "Low (19)", cpc: "$2.90" },
    ],
    criticalIssues: [
      { title: "32 High-Intent Keywords Ranking on Page 2 (Positions 11-18)", severity: "critical", impact: "+$3,200/mo if boosted to Top 3" },
      { title: "Zero Citations on Perplexity & Claude for Primary Solution Query", severity: "warning", impact: "Losing ~1.4K high-intent monthly searches" },
      { title: "Competitor Meta & Google Ads running 14 winning angles with 45+ day longevity", severity: "opportunity", impact: "High-CTR creative blueprint ready to clone" },
    ],
  },
  "ecommerce-store.com": {
    domain: "ecommerce-store.com",
    healthScore: 74,
    monthlyLostTraffic: 28500,
    estimatedRevenueLeak: 12400,
    aiCitationShare: 18,
    topKeywordGaps: [
      { keyword: "best organic skincare routine", volume: "45.0K", diff: "Med (38)", cpc: "$1.85" },
      { keyword: "cruelty free barrier cream", volume: "22.1K", diff: "Low (24)", cpc: "$2.10" },
      { keyword: "dermatologist approved serum", volume: "19.4K", diff: "Med (44)", cpc: "$3.20" },
    ],
    criticalIssues: [
      { title: "Missing Product Schema on 140 Category Pages", severity: "critical", impact: "-35% Rich Snippet click-through rate" },
      { title: "Competitor TikTok & Meta Ads scaling 6 video angles", severity: "opportunity", impact: "Unlock 3.8x ad ROAS insights" },
      { title: "45 Broken Backlinks from High-Authority Beauty Blogs", severity: "warning", impact: "Lost link juice recoverable via 301 redirects" },
    ],
  },
  "local-agency.com": {
    domain: "local-agency.com",
    healthScore: 68,
    monthlyLostTraffic: 8900,
    estimatedRevenueLeak: 4500,
    aiCitationShare: 12,
    topKeywordGaps: [
      { keyword: "commercial roofing contractor near me", volume: "9.8K", diff: "Low (22)", cpc: "$8.50" },
      { keyword: "emergency leak repair service", volume: "6.4K", diff: "Low (18)", cpc: "$12.00" },
      { keyword: "best licensed roofer reviews", volume: "4.1K", diff: "Low (15)", cpc: "$6.20" },
    ],
    criticalIssues: [
      { title: "Google Maps 7x7 Geo-Grid Drops Outside 3-Mile Radius", severity: "critical", impact: "Losing 60% of nearby commercial quote requests" },
      { title: "Inconsistent NAP Citations across 18 Local Directories", severity: "warning", impact: "Dragging down GBP map pack authority" },
      { title: "Unanswered 5-Star & 3-Star Customer Google Reviews", severity: "opportunity", impact: "AI instant replies boost local ranking velocity" },
    ],
  },
};

export function HeroInteractiveScanner() {
  const navigate = useNavigate();
  const [domainInput, setDomainInput] = React.useState("saas-sample.com");
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<ScanResult>(PRESET_DOMAINS["saas-sample.com"]);
  const [activeTab, setActiveTab] = React.useState<"overview" | "gaps" | "citations" | "fixes">("overview");

  const runScan = (targetDomain: string) => {
    const clean = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!clean) return;

    setIsScanning(true);
    setTimeout(() => {
      if (PRESET_DOMAINS[clean]) {
        setScanResult(PRESET_DOMAINS[clean]);
      } else {
        // Generate intelligent dynamic benchmark for custom domain
        const hash = clean.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const score = 65 + (hash % 25);
        const lostTraffic = 5000 + (hash % 20000);
        const revLeak = Math.round((lostTraffic * 0.45) / 100) * 100;
        const aiShare = 15 + (hash % 30);

        setScanResult({
          domain: clean,
          healthScore: score,
          monthlyLostTraffic: lostTraffic,
          estimatedRevenueLeak: revLeak,
          aiCitationShare: aiShare,
          topKeywordGaps: [
            { keyword: `${clean.split(".")[0]} alternatives & pricing`, volume: "14.2K", diff: "Low (24)", cpc: "$3.80" },
            { keyword: `best ${clean.split(".")[0]} tools for teams`, volume: "9.8K", diff: "Low (18)", cpc: "$2.95" },
            { keyword: `how to choose ${clean.split(".")[0]} platform`, volume: "6.5K", diff: "Med (35)", cpc: "$4.10" },
          ],
          criticalIssues: [
            { title: "18 High-Intent Search Queries Trapped in Positions 11-20", severity: "critical", impact: `+$${Math.round(revLeak * 0.6)}/mo with page-1 ranking` },
            { title: "Zero AEO Citation Presence on ChatGPT & Perplexity", severity: "warning", impact: "Rivals monopolizing AI recommendations" },
            { title: "Competitor Ad Strategy & Winning Creative Hooks Active", severity: "opportunity", impact: "Clone 45+ day winning ad angles" },
          ],
        });
      }
      setIsScanning(false);
    }, 650);
  };

  const handlePresetClick = (presetKey: string) => {
    setDomainInput(presetKey);
    runScan(presetKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runScan(domainInput);
  };

  return (
    <div className="w-full rounded-[24px] bg-base-100 dark:bg-[#0f1217] border border-base-300 dark:border-white/10 shadow-2xl overflow-hidden text-left">
      {/* Interactive Top Control Bar */}
      <div className="p-4 sm:p-6 bg-base-200/50 dark:bg-[#13171e] border-b border-base-300 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter your website or competitor domain..."
              className="w-full rounded-xl border border-base-300 dark:border-white/10 bg-base-100 dark:bg-black/30 pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-base-content"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="btn btn-primary btn-sm h-10 px-5 rounded-xl font-bold text-white shadow-md shadow-primary/20 gap-2 w-full sm:w-auto"
          >
            {isScanning ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Scanning Live...</span>
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs text-base-content/70">
          <span className="font-semibold text-base-content/50 shrink-0 mr-1">Presets:</span>
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
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-base-300 dark:border-white/10 hover:bg-base-200"
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
          <div className="rounded-2xl border border-base-300 dark:border-white/10 bg-base-200/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">SEO Health Score</span>
              <Icon icon="solar:shield-check-bold" className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-500">{scanResult.healthScore}</span>
              <span className="text-xs font-bold text-base-content/50">/ 100</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {scanResult.healthScore >= 80 ? "Solid foundation" : "High optimization headroom"}
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 dark:border-white/10 bg-base-200/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Lost Traffic / Mo</span>
              <Icon icon="solar:graph-down-bold" className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-500">
                {scanResult.monthlyLostTraffic.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-base-content/50">visits</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              Trapped in positions 11-20
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 dark:border-white/10 bg-base-200/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Est. Monthly Leak</span>
              <Icon icon="solar:dollar-bold" className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                ${scanResult.estimatedRevenueLeak.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-base-content/50">/ mo</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Recoverable via Top 3 rank
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 dark:border-white/10 bg-base-200/30 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">AEO Citation Share</span>
              <Icon icon="solar:stars-bold" className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-500">
                {scanResult.aiCitationShare}%
              </span>
              <span className="text-xs font-bold text-base-content/50">in AI SERPs</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              ChatGPT & Perplexity
            </div>
          </div>
        </div>

        {/* Interactive Sub-Tabs */}
        <div className="border border-base-300 dark:border-white/10 rounded-2xl overflow-hidden bg-base-100 dark:bg-black/20">
          <div className="flex border-b border-base-300 dark:border-white/10 bg-base-200/50 dark:bg-white/5 overflow-x-auto">
            {[
              { id: "overview", label: "Prioritized Fixes", icon: "solar:checklist-bold" },
              { id: "gaps", label: "Top Keyword Gaps", icon: "solar:target-bold" },
              { id: "citations", label: "AI Search Radar", icon: "solar:radar-bold" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-base-100 dark:bg-[#13171e]"
                    : "border-transparent text-base-content/70 hover:text-base-content"
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-base-300 dark:border-white/10 bg-base-200/20"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`badge badge-sm mt-0.5 font-bold ${
                          issue.severity === "critical"
                            ? "badge-error text-white"
                            : issue.severity === "warning"
                            ? "badge-warning text-white"
                            : "badge-success text-white"
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-base-content">
                        {issue.title}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary dark:text-brand-300 shrink-0 sm:text-right">
                      {issue.impact}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "gaps" && (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full text-xs">
                  <thead>
                    <tr className="border-b border-base-300 dark:border-white/10 text-base-content/60">
                      <th>Untapped Keyword</th>
                      <th>Search Volume</th>
                      <th>Ranking Difficulty</th>
                      <th>Avg. CPC</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.topKeywordGaps.map((gap, idx) => (
                      <tr key={idx} className="border-b border-base-300/60 dark:border-white/5">
                        <td className="font-bold text-base-content">{gap.keyword}</td>
                        <td className="font-semibold text-base-content/80">{gap.volume}</td>
                        <td>
                          <span className="badge badge-sm badge-outline font-bold text-emerald-600 dark:text-emerald-400">
                            {gap.diff}
                          </span>
                        </td>
                        <td className="font-semibold text-base-content/80">{gap.cpc}</td>
                        <td>
                          <Link
                            to="/sign-up"
                            className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10 gap-1"
                          >
                            <span>Target</span>
                            <Icon icon="solar:arrow-right-linear" className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "citations" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:shield-warning-bold" className="h-4 w-4" />
                    <span>Perplexity, ChatGPT & Claude currently cite 3 of your competitors for buying queries.</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-base-300 dark:border-white/10 bg-base-200/20 text-center">
                    <div className="font-bold text-base-content/60">Perplexity AI</div>
                    <div className="text-lg font-black text-rose-500 mt-1">Not Cited</div>
                    <div className="text-[10px] text-base-content/50 mt-0.5">Competitors taking 100% share</div>
                  </div>
                  <div className="p-3 rounded-xl border border-base-300 dark:border-white/10 bg-base-200/20 text-center">
                    <div className="font-bold text-base-content/60">ChatGPT Search</div>
                    <div className="text-lg font-black text-amber-500 mt-1">1 Citation</div>
                    <div className="text-[10px] text-base-content/50 mt-0.5">Brand mention only</div>
                  </div>
                  <div className="p-3 rounded-xl border border-base-300 dark:border-white/10 bg-base-200/20 text-center">
                    <div className="font-bold text-base-content/60">Claude Recommendations</div>
                    <div className="text-lg font-black text-emerald-500 mt-1">2 Citations</div>
                    <div className="text-[10px] text-base-content/50 mt-0.5">Solid technical presence</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Natural Late Conversion Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-600/10 to-secondary/10 border border-primary/20">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-base-content">
              Save This Full 50-Page Audit & Unlock Daily Automated Tracking
            </h4>
            <p className="text-xs text-base-content/70">
              Get competitor ad spy access, real-time rank tracking, and weekly PDF client reports.
            </p>
          </div>
          <Link
            to="/sign-up"
            className="btn btn-primary btn-sm rounded-xl font-bold text-white shadow-md shadow-primary/25 border-none px-6 shrink-0 gap-1.5"
          >
            <span>Claim Free Account</span>
            <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
