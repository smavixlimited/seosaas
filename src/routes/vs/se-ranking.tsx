import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, TrendingUp, X, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/vs/se-ranking")({
  component: SkorviaVsSeRankingPage,
});

function SkorviaVsSeRankingPage() {
  const comparisonRows = [
    {
      feature: "Transparent Pricing Architecture",
      skorvia: "Simple $29/mo flat tier with predictable generous quotas",
      competitor: "Complex pricing matrix based on check frequency & limit combinations",
      winner: "skorvia",
    },
    {
      feature: "AI Search & AEO Optimization",
      skorvia: "Built-in ChatGPT, Claude & Perplexity answer engine tracker",
      competitor: "Traditional search engines only (No AEO / LLM audits)",
      winner: "skorvia",
    },
    {
      feature: "Instant IndexNow Push Studio",
      skorvia: "1-Click automated URL batch indexing push to Bing & Yandex",
      competitor: "No native IndexNow integration",
      winner: "skorvia",
    },
    {
      feature: "Local Map Rank Geo-Grid",
      skorvia: "Visual 3x3 / 5x5 Google Maps geo-coordinate rank tracking",
      competitor: "Separate Local Marketing add-on subscription fees",
      winner: "skorvia",
    },
    {
      feature: "Multi-Currency African & Global Billing",
      skorvia: "Paystack, Flutterwave, LemonSqueezy (USD, NGN, EUR, GBP, GHS, KES, ZAR)",
      competitor: "Global credit cards & USD/EUR only",
      winner: "skorvia",
    },
    {
      feature: "SAM AI Copilot Live Assistant",
      skorvia: "Conversational agent with direct access to your site audit data",
      competitor: "Traditional static dashboards without AI agents",
      winner: "skorvia",
    },
    {
      feature: "Keyword Intelligence & SERP Explorer",
      skorvia: "Global keyword volumes, historical CPC & intent tags",
      competitor: "Keyword suggestions and search volume database",
      winner: "tie",
    },
    {
      feature: "Backlink Analysis & Toxic Link Alerts",
      skorvia: "Referring domains, anchor text distribution & lost links",
      competitor: "Comprehensive backlink checking database",
      winner: "tie",
    },
    {
      feature: "1-Click CSV Migration",
      skorvia: "Directly import your SE Ranking exported CSV files",
      competitor: "Manual CSV copy/pasting",
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
            {BRAND_CONFIG.name} vs. <span className="text-primary">SE Ranking</span>
          </h1>

          <p className="text-base sm:text-xl text-base-content/75 max-w-2xl mx-auto leading-relaxed font-medium">
            Looking for a simpler, modern SEO platform with native AI answer engine optimization and zero confusing add-on tiers? See why teams prefer {BRAND_CONFIG.name}.
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
              View Simple Pricing
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
              <h3 className="font-extrabold text-base text-base-content">No Complicated Check Frequencies</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                All {BRAND_CONFIG.name} plans include automatic daily rank tracking without restricting you to weekly or monthly check intervals to lower price.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-base-300 bg-base-200/40 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Icon icon="solar:stars-bold" className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-base-content">Next-Gen AI &amp; AEO Optimization</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Monitor and optimize your visibility in generative AI models like ChatGPT, Claude, and Perplexity Search.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-base-300 bg-base-200/40 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-base-content">All-in-One Local &amp; IndexNow</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Enjoy built-in Google Maps 3x3 Geo-Grid rank tracking and instant IndexNow submissions without extra add-on invoices.
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
              Complete Feature Comparison
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60">
              Comparing standard feature sets, local rankings, and AI capabilities.
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
                    SE Ranking
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
            Seamless 1-Click Migration from SE Ranking
          </h2>
          <p className="text-sm sm:text-base text-base-content/70 max-w-xl mx-auto leading-relaxed">
            Import your ranking keywords, tags, and search volumes directly from SE Ranking in seconds with our universal CSV migration wizard.
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
