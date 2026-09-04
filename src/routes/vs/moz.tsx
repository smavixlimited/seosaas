import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, TrendingUp, X, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/vs/moz")({
  component: SkorviaVsMozPage,
});

function SkorviaVsMozPage() {
  const comparisonRows = [
    {
      feature: "Monthly Starting Price",
      skorvia: "$29 / mo (Modern high-speed engine)",
      competitor: "$99 / mo (Legacy Moz Pro Standard)",
      winner: "skorvia",
    },
    {
      feature: "Index Freshness & Update Velocity",
      skorvia: "Daily rank tracking & real-time backlink refresh",
      competitor: "Monthly Mozscape updates & slower crawling cycles",
      winner: "skorvia",
    },
    {
      feature: "AI Search & AEO Optimization",
      skorvia: "ChatGPT, Claude & Perplexity share of voice tracking",
      competitor: "Zero AI answer engine tracking",
      winner: "skorvia",
    },
    {
      feature: "Local Map Rank Geo-Grid",
      skorvia: "Built-in 3x3 / 5x5 Google Maps rank grid tracker",
      competitor: "Requires separate Moz Local subscription ($14/mo/loc)",
      winner: "skorvia",
    },
    {
      feature: "SAM AI Copilot Agent",
      skorvia: "Interactive SEO Copilot with live DataForSEO tooling",
      competitor: "No conversational AI assistance",
      winner: "skorvia",
    },
    {
      feature: "Multi-Currency & Global Billing",
      skorvia: "Native USD, NGN, EUR, GBP, GHS, KES, ZAR via Paystack & Flutterwave",
      competitor: "USD Only via Stripe / US Credit Cards",
      winner: "skorvia",
    },
    {
      feature: "Technical Site Crawl Speed",
      skorvia: "Asynchronous distributed edge crawler with Core Web Vitals",
      competitor: "Legacy crawler with limited concurrent page limits",
      winner: "skorvia",
    },
    {
      feature: "Domain Authority & Link Metrics",
      skorvia: "Full Referring Domains, Anchors & Toxic Link Audits",
      competitor: "Proprietary Moz Domain Authority (DA / PA)",
      winner: "tie",
    },
    {
      feature: "1-Click CSV Migration",
      skorvia: "Auto-detects Moz CSV exports and maps columns instantly",
      competitor: "Manual import only",
      winner: "skorvia",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 border-b border-base-200 bg-linear-to-b from-primary/5 via-base-100 to-base-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black text-primary ring-1 ring-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Modern SEO Platform Comparison</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content max-w-4xl mx-auto leading-tight">
            {BRAND_CONFIG.name} vs. <span className="text-primary">Moz Pro</span>
          </h1>

          <p className="text-base sm:text-xl text-base-content/75 max-w-2xl mx-auto leading-relaxed font-medium">
            Looking for a faster, modern alternative to Moz Pro? Discover real-time daily rank tracking, AI search optimization, and modern developer tooling at a fraction of the cost.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/sign-up"
              className="btn btn-primary btn-md rounded-2xl font-black text-white px-8 shadow-lg shadow-primary/30"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/pricing"
              className="btn btn-outline btn-md rounded-2xl font-bold px-6"
            >
              Compare All Pricing Plans
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Value Pillars */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-base-300 bg-base-200/40 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-base-content">70% Lower Cost ($29 vs $99)</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Get full rank tracking, site audits, and backlink analysis starting at \$29/mo rather than \$99/mo.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-base-300 bg-base-200/40 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-base-content">Real-Time Daily Rank Updates</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Never wait weeks for index refreshes. Track keyword movements and SERP fluctuations every single day.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-base-300 bg-base-200/40 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                <Icon icon="solar:stars-bold" className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-base-content">AEO &amp; AI Citation Tracking</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Stay ahead of search transformation by auditing how AI chat engines cite your web assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 bg-base-200/30 border-y border-base-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-base-content">
              Direct Feature Comparison
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60">
              Side-by-side analysis of features, crawling velocity, and enterprise support.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <table className="table table-sm w-full text-xs">
              <thead className="bg-base-200/70 text-base-content/80">
                <tr>
                  <th className="py-4 px-5 text-sm font-black">Feature / Capability</th>
                  <th className="py-4 px-5 text-sm font-black text-primary bg-primary/5">
                    {BRAND_CONFIG.name}
                  </th>
                  <th className="py-4 px-5 text-sm font-black text-base-content/70">
                    Moz Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-base-200/40 transition-colors">
                    <td className="py-3.5 px-5 font-extrabold text-base-content">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-primary bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{row.skorvia}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-base-content/70">
                      <div className="flex items-center gap-2">
                        {row.winner === "skorvia" ? (
                          <X className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                        <span>{row.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Migration Banner */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6 rounded-3xl border border-primary/20 bg-linear-to-b from-primary/10 to-base-100 p-8 sm:p-12 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-base-content">
            Migrate from Moz Pro in 1 Click
          </h2>
          <p className="text-sm sm:text-base text-base-content/70 max-w-xl mx-auto leading-relaxed">
            Drag and drop your Moz exported CSV file into {BRAND_CONFIG.name}. Our importer automatically extracts keywords, monthly search volume, and difficulty scores.
          </p>
          <div className="pt-2">
            <Link
              to="/sign-up"
              className="btn btn-primary btn-md rounded-2xl font-black text-white px-8 shadow-md shadow-primary/30"
            >
              Start Free Migration Trial &rarr;
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
