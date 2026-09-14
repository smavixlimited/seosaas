import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/vs-ahrefs-semrush")({
  component: ComparisonPage,
});

function ComparisonPage() {
  const comparisonData = [
    {
      metric: "Starting Monthly Price",
      skorvia: "$29 / mo",
      ahrefs: "$129 / mo",
      semrush: "$139.95 / mo",
      winner: "skorvia",
    },
    {
      metric: "Seat Tax / User Limits",
      skorvia: "Unlimited Team Seats",
      ahrefs: "$30/mo per user add-on",
      semrush: "$45/mo per user add-on",
      winner: "skorvia",
    },
    {
      metric: "AI Search & AEO (ChatGPT, Perplexity & Claude)",
      skorvia: true,
      ahrefs: false,
      semrush: false,
      winner: "skorvia",
    },
    {
      metric: "Multi-Network Competitor Ad Spy (Meta, Google, TikTok)",
      skorvia: true,
      ahrefs: false,
      semrush: "Google Ads Only",
      winner: "skorvia",
    },
    {
      metric: "MCP Autonomous Agent Protocol Support",
      skorvia: true,
      ahrefs: false,
      semrush: false,
      winner: "skorvia",
    },
    {
      metric: "Instant IndexNow API Submissions",
      skorvia: true,
      ahrefs: false,
      semrush: false,
      winner: "skorvia",
    },
    {
      metric: "Keyword Research & Search Intent Clustering",
      skorvia: true,
      ahrefs: true,
      semrush: true,
      winner: "tie",
    },
    {
      metric: "Backlink Explorer & Referring Domains",
      skorvia: true,
      ahrefs: true,
      semrush: true,
      winner: "tie",
    },
    {
      metric: "Deep Technical Site Audit & Core Web Vitals",
      skorvia: true,
      ahrefs: true,
      semrush: true,
      winner: "tie",
    },
    {
      metric: "White-Label Agency PDF Reports",
      skorvia: "Included in Agency ($199)",
      ahrefs: "Enterprise ($999+)",
      semrush: "Agency Add-on (+$249/mo)",
      winner: "skorvia",
    },
  ];

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24 overflow-hidden relative">
        <div className="main-container">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-green">Head-to-Head Breakdown</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name} vs. Ahrefs vs. Semrush
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto leading-relaxed">
              Why fast-growing founders, marketing directors, and modern
              agencies are switching from legacy tools to {BRAND_CONFIG.name}.
            </p>
          </div>

          {/* 3 Core Advantage Pillars */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-4">
              <div className="size-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-brand-300 flex items-center justify-center">
                <Icon
                  icon="solar:wallet-money-bold-duotone"
                  className="size-6"
                />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Flat-Rate Zero Seat Tax
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Legacy tools charge $1,500–$5,000+/year and charge extra for
                every single team seat. {BRAND_CONFIG.name} provides flat-rate
                pricing with unlimited team collaboration.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-4">
              <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                <Icon icon="solar:stars-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Native AI &amp; AEO Citation Radar
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Track your brand’s citation share across ChatGPT, Perplexity,
                and Claude search responses—crucial capabilities that legacy
                platforms still completely ignore.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Icon icon="solar:bolt-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Autonomous AI &amp; MCP Native
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Connect Claude Code, Cursor, or your internal AI agents directly
                to live SERP and backlink pipelines via our built-in Model
                Context Protocol (MCP) server.
              </p>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div
            id="feature-matrix"
            className="mt-16 max-w-5xl mx-auto rounded-[28px] border border-stroke-3/80 dark:border-stroke-7 bg-white dark:bg-background-6 shadow-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 border-b border-stroke-3/60 dark:border-stroke-7 bg-background-2/50 dark:bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-heading-4 font-bold text-secondary dark:text-accent font-interTight">
                  Comprehensive Feature &amp; Pricing Matrix
                </h3>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 mt-1">
                  Verified platform feature comparison based on current publicly
                  published tier limits.
                </p>
              </div>
              <Link
                to="/sign-up"
                className="btn btn-primary btn-sm rounded-full font-bold text-white shadow-md shadow-primary/25 shrink-0 px-5"
              >
                Try Skorvia Free
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stroke-3/60 dark:border-stroke-7 bg-background-2/40 dark:bg-secondary/40 text-xs font-bold uppercase tracking-wider text-secondary/60 dark:text-accent/60">
                    <th className="py-4 px-6">Capability / Metric</th>
                    <th className="py-4 px-6 text-primary dark:text-brand-300 font-extrabold bg-primary/5 dark:bg-primary/10">
                      {BRAND_CONFIG.name}
                    </th>
                    <th className="py-4 px-6">Ahrefs</th>
                    <th className="py-4 px-6">Semrush</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-3/40 dark:divide-stroke-7/60 text-xs sm:text-sm">
                  {comparisonData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-background-2/40 dark:hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-secondary dark:text-accent">
                        {row.metric}
                      </td>
                      <td className="py-4 px-6 font-bold bg-primary/5 dark:bg-primary/10 text-primary dark:text-brand-300">
                        {typeof row.skorvia === "boolean" ? (
                          row.skorvia ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                              <Icon
                                icon="solar:check-circle-bold"
                                className="size-5"
                              />
                              <span>Included</span>
                            </span>
                          ) : (
                            <Icon
                              icon="solar:close-circle-bold"
                              className="size-5 text-rose-500"
                            />
                          )
                        ) : (
                          <span className="font-extrabold">{row.skorvia}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-secondary/70 dark:text-accent/70">
                        {typeof row.ahrefs === "boolean" ? (
                          row.ahrefs ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-emerald-500"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-secondary/40 dark:text-accent/40 font-medium">
                              <Icon
                                icon="solar:close-circle-bold"
                                className="size-4"
                              />
                              <span>Not Available</span>
                            </span>
                          )
                        ) : (
                          <span>{row.ahrefs}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-secondary/70 dark:text-accent/70">
                        {typeof row.semrush === "boolean" ? (
                          row.semrush ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="size-5 text-emerald-500"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-secondary/40 dark:text-accent/40 font-medium">
                              <Icon
                                icon="solar:close-circle-bold"
                                className="size-4"
                              />
                              <span>Not Available</span>
                            </span>
                          )
                        ) : (
                          <span>{row.semrush}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Conversion CTA */}
          <div className="mt-16 max-w-4xl mx-auto rounded-[28px] bg-gradient-to-r from-primary via-indigo-900 to-secondary p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <span className="badge badge-green text-xs font-bold">
                100% Free Plan Available
              </span>
              <h2 className="text-heading-3 font-bold text-white font-interTight">
                Ready to replace expensive legacy SEO suites?
              </h2>
              <p className="text-tagline-1 text-white/80 max-w-xl mx-auto">
                Start tracking competitor ad variations, keyword revenue leaks,
                and AI citations in under 60 seconds.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/sign-up"
                  className="btn btn-white hover:btn-primary dark:btn-white-dark rounded-full px-8 font-bold text-xs h-12 flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Get Started Free</span>
                  <Icon icon="solar:arrow-right-linear" className="size-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="btn btn-outline border-white/30 text-white hover:bg-white/10 rounded-full px-6 font-semibold text-xs h-12 flex items-center justify-center"
                >
                  View All Pricing Tiers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
