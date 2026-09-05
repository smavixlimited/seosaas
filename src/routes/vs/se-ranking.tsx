import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
      feature: "Starting Monthly Price",
      skorvia: "$29 / mo (Predictable)",
      competitor: "$55 / mo (Strict frequency restrictions)",
      winner: "skorvia",
    },
    {
      feature: "Multi-Network Competitor Ad Spy",
      skorvia: "Meta, Google, TikTok & LinkedIn creative monitoring",
      competitor: "Google Paid Search only",
      winner: "skorvia",
    },
    {
      feature: "AI Search Engine Citation Radar",
      skorvia: "ChatGPT, Perplexity & Claude citation share tracking",
      competitor: "Not Available",
      winner: "skorvia",
    },
    {
      feature: "Team Collaboration Seats",
      skorvia: "Unlimited Team Seats included",
      competitor: "Paywall per additional user account",
      winner: "skorvia",
    },
    {
      feature: "White-Label Executive Reports",
      skorvia: "1-Click branded client PDF board reports",
      competitor: "Available on higher tiers",
      winner: "tie",
    },
  ];

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24 overflow-hidden relative">
        <div className="main-container">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-green">Head-to-Head Comparison</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name} vs. SE Ranking
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto leading-relaxed">
              Why high-velocity brands and modern marketing teams choose{" "}
              {BRAND_CONFIG.name} for multi-channel search & ad intelligence.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary dark:text-brand-300 flex items-center justify-center">
                <Icon icon="solar:eye-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                4-Network Ad Spying
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Decode competitor creatives and copy angles across TikTok, Meta,
                LinkedIn, and Google simultaneously.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Icon icon="solar:stars-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                AEO &amp; LLM Citations
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Optimize for the modern search landscape by tracking how AI chat
                engines recommend your product.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="size-6"
                />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Zero Seat Taxes
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Collaborate with unlimited team members and clients without
                per-user licensing fees.
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-5xl mx-auto rounded-[28px] border border-stroke-3/80 dark:border-stroke-7 bg-white dark:bg-background-6 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-stroke-3/60 dark:border-stroke-7 bg-background-2/50 dark:bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-heading-4 font-bold text-secondary dark:text-accent font-interTight">
                  SE Ranking vs. {BRAND_CONFIG.name} Matrix
                </h3>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 mt-1">
                  Comparing search intelligence scope, pricing predictability,
                  and modern AI capabilities.
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
                    <th className="py-4 px-6">SE Ranking</th>
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
