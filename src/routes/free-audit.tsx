import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { runFreeLeadAuditServerFn } from "@/serverFunctions/lead-audit";
import type { LeadAuditResult } from "@/services/lead-audit.service";

export const Route = createFileRoute("/free-audit")({
  component: FreeAuditPage,
});

function FreeAuditPage() {
  const [url, setUrl] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<LeadAuditResult | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await runFreeLeadAuditServerFn({
        data: {
          url: url.trim(),
          email: email.trim(),
        },
      });
      setResult(res);
    } catch (err) {
      alert("Failed to run audit: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredChecks = result
    ? activeCategory === "all"
      ? result.checks
      : result.checks.filter((c) => c.category === activeCategory)
    : [];

  const passedCount = result ? result.checks.filter((c) => c.passed).length : 0;
  const issueCount = result ? result.checks.length - passedCount : 0;

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <main className="py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Free SEO Health Scanner
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-base-content">
              Audit Any Website's On-Page & Technical SEO in Seconds.
            </h1>
            <p className="text-sm sm:text-base text-base-content/70">
              Enter your website URL and email to get a breakdown of critical indexation, performance, and ranking factors.
            </p>
          </div>

          {/* Audit Input Form */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-base-300 bg-base-200/50 p-4 sm:p-6 shadow-xl space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/70">Website URL</label>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                    <input
                      type="text"
                      required
                      placeholder="example.com"
                      className="input input-bordered input-sm w-full pl-9 rounded-xl text-xs"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-base-content/70">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="input input-bordered input-sm w-full pl-9 rounded-xl text-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary rounded-2xl w-full font-bold text-white shadow-md shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Technical & Content Signals...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" /> Run Instant SEO Audit
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Audit Results View */}
          {result && (
            <div className="mt-14 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Score Overview Banner */}
              <div className="rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Circular Score Gauge */}
                  <div
                    className={`h-24 w-24 rounded-full flex flex-col items-center justify-center font-black text-3xl shrink-0 shadow-lg border-4 ${
                      result.overallScore >= 80
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : result.overallScore >= 50
                          ? "border-amber-500 bg-amber-500/10 text-amber-600"
                          : "border-error bg-error/10 text-error"
                    }`}
                  >
                    <span>{result.overallScore}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60">/100</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Audit Report For
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-base-content">
                      {result.domain}
                    </h2>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="badge badge-success badge-sm font-bold gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {passedCount} Passed
                      </span>
                      <span className="badge badge-error badge-sm font-bold gap-1">
                        <AlertTriangle className="h-3 w-3" /> {issueCount} Action Items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversion Callout */}
                <div className="text-right">
                  <Link
                    to="/sign-up"
                    className="btn btn-primary rounded-2xl font-bold text-white shadow-md shadow-primary/25 gap-2"
                  >
                    Unlock Full 200-Point Audit <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-[11px] text-base-content/60 mt-1.5">
                    Includes Backlink Velocity, Keyword Rankings, and 1-Click Fixes.
                  </p>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-base-300 pb-3 overflow-x-auto text-xs font-bold">
                {["all", "technical", "content", "performance", "mobile"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-xl px-3.5 py-1.5 capitalize transition-all ${
                      activeCategory === cat
                        ? "bg-primary text-white shadow-xs"
                        : "bg-base-200 text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Checks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChecks.map((chk) => (
                  <div
                    key={chk.id}
                    className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs space-y-2 hover:border-base-content/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {chk.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                        )}
                        <h3 className="text-sm font-bold text-base-content">{chk.title}</h3>
                      </div>
                      <span
                        className={`badge badge-sm font-black ${
                          chk.passed ? "badge-success text-white" : "badge-warning"
                        }`}
                      >
                        {chk.score}%
                      </span>
                    </div>

                    <p className="text-xs text-base-content/80">{chk.details}</p>

                    <div className="rounded-xl bg-base-200/60 p-2.5 text-[11px] text-base-content/70 border border-base-300/40">
                      <span className="font-bold text-primary">Recommendation: </span>
                      {chk.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
