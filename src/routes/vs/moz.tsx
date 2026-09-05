import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
      feature: "Starting Monthly Price",
      skorvia: "$29 / mo (Modern Engine)",
      competitor: "$99 / mo (Legacy Moz Pro)",
      winner: "skorvia",
    },
    {
      feature: "AI Search & AEO Citation Radar",
      skorvia: "Included (ChatGPT, Claude & Perplexity)",
      competitor: "Not Available",
      winner: "skorvia",
    },
    {
      feature: "Multi-Network Ad Spy (Meta, Google, TikTok)",
      skorvia: "Included across 4 networks",
      competitor: "Not Available",
      winner: "skorvia",
    },
    {
      feature: "Local Geo-Grid Map Pack",
      skorvia: "Built-in GPS 7x7 coordinate tracker",
      competitor: "Separate $14/mo per location add-on",
      winner: "skorvia",
    },
    {
      feature: "Crawling & Page Speed Auditing",
      skorvia: "Real-time Core Web Vitals + JS crawler",
      competitor: "Weekly scheduled crawls",
      winner: "skorvia",
    },
    {
      feature: "Autonomous MCP Agent Tools",
      skorvia: "Built-in Model Context Protocol Server",
      competitor: "No AI Agent Integration",
      winner: "skorvia",
    },
  ];

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24 overflow-hidden relative">
        <div className="main-container">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-green">Comparison Breakdown</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name} vs. Moz Pro
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto leading-relaxed">
              Why modern brands are replacing slow, legacy SEO suites with{" "}
              {BRAND_CONFIG.name}'s multi-channel intelligence workspace.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary dark:text-brand-300 flex items-center justify-center">
                <Icon icon="solar:bolt-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Real-Time Data
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                No more waiting a week for index updates. Get fresh daily rank
                updates and instant on-demand site audits.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Icon icon="solar:stars-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Multi-Channel Scope
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Combine organic SERP, Google Maps local packs, multi-network
                competitor ads, and AI Answer Engine citations in one place.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Icon icon="solar:tag-price-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                70% Better Value
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Start at $29/mo with full feature access and unlimited team
                seats instead of $99/mo for restrictive legacy limits.
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-5xl mx-auto rounded-[28px] border border-stroke-3/80 dark:border-stroke-7 bg-white dark:bg-background-6 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-stroke-3/60 dark:border-stroke-7 bg-background-2/50 dark:bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-heading-4 font-bold text-secondary dark:text-accent font-interTight">
                  Moz Pro vs. {BRAND_CONFIG.name} Matrix
                </h3>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 mt-1">
                  Side-by-side feature comparison based on current published
                  capabilities.
                </p>
              </div>
              <Link
                to="/sign-up"
                className="btn btn-primary btn-sm rounded-full font-bold text-white shadow-md shadow-primary/25 shrink-0 px-5"
              >
                Claim Free Account
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stroke-3/60 dark:border-stroke-7 bg-background-2/40 dark:bg-secondary/40 text-xs font-bold uppercase tracking-wider text-secondary/60 dark:text-accent/60">
                    <th className="py-4 px-6">Capability</th>
                    <th className="py-4 px-6 text-primary dark:text-brand-300 font-extrabold bg-primary/5 dark:bg-primary/10">
                      {BRAND_CONFIG.name}
                    </th>
                    <th className="py-4 px-6">Moz Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-3/40 dark:divide-stroke-7/60 text-xs sm:text-sm">
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-background-2/40 dark:hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-secondary dark:text-accent">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 font-bold bg-primary/5 dark:bg-primary/10 text-primary dark:text-brand-300">
                        {row.skorvia}
                      </td>
                      <td className="py-4 px-6 text-secondary/70 dark:text-accent/70">
                        {row.competitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
