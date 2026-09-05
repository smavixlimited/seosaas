import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/vs/ahrefs")({
  component: SkorviaVsAhrefsPage,
});

function SkorviaVsAhrefsPage() {
  const comparisonRows = [
    {
      feature: "Starting Monthly Price",
      skorvia: "$29 / mo (Flat Rate)",
      competitor: "$129 / mo (+ Strict credit gates)",
      winner: "skorvia",
    },
    {
      feature: "Team Seats & Collaboration",
      skorvia: "Unlimited Team Seats Included",
      competitor: "$30/mo per extra seat fee",
      winner: "skorvia",
    },
    {
      feature: "Credit Limits & Overage Traps",
      skorvia: "Fair generous quotas & zero hidden overage penalties",
      competitor: "500 credits consumed in minutes with expensive reloads",
      winner: "skorvia",
    },
    {
      feature: "AI Search & AEO Optimization",
      skorvia: "Track visibility across ChatGPT, Claude & Perplexity",
      competitor: "Traditional Google SERP only (No LLM / AEO tracking)",
      winner: "skorvia",
    },
    {
      feature: "Competitor Ad Creative Spy",
      skorvia: "Meta, Google, TikTok, and LinkedIn ad spy engine",
      competitor: "Zero social ad spy capabilities",
      winner: "skorvia",
    },
    {
      feature: "Local Map Rank Geo-Grid",
      skorvia: "3x3 & 5x5 Google Maps pin tracker included",
      competitor: "Requires separate expensive local rank add-ons",
      winner: "skorvia",
    },
    {
      feature: "1-Click CSV Migration",
      skorvia: "Directly import your Ahrefs exported keywords in 1 click",
      competitor: "No automatic project migration assistance",
      winner: "skorvia",
    },
    {
      feature: "Keyword Intelligence & Intent",
      skorvia: "Global search queries with transactional intent grouping",
      competitor: "Keyword Explorer Database",
      winner: "tie",
    },
    {
      feature: "Backlink Explorer & Anchor Texts",
      skorvia: "Real-time Live & Historical Backlink Profiles",
      competitor: "Extensive Live Backlink Index",
      winner: "tie",
    },
  ];

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24 overflow-hidden relative">
        <div className="main-container">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-green">Alternative Breakdown</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name} vs. Ahrefs
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto leading-relaxed">
              Tired of unexpected credit overage fees and expensive user seat penalties? Discover why top growth teams are switching from Ahrefs to {BRAND_CONFIG.name}.
            </p>
          </div>

          {/* Key Advantages Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary dark:text-brand-300 flex items-center justify-center">
                <Icon icon="solar:lock-unlocked-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                No Credit Traps
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Never get locked out of your reports mid-month. Enjoy predictable pricing without aggressive credit caps.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Icon icon="solar:stars-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Future-Proof AEO Tracking
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Monitor and defend your brand’s AI answer engine citations across ChatGPT, Perplexity, and Claude in real time.
              </p>
            </div>

            <div className="rounded-[24px] border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 p-7 shadow-xl space-y-3">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="size-6" />
              </div>
              <h3 className="text-heading-5 font-bold text-secondary dark:text-accent font-interTight">
                Unlimited Seats
              </h3>
              <p className="text-tagline-3 text-secondary/70 dark:text-accent/70 leading-relaxed">
                Invite your entire team, agency clients, and freelancers without paying $30/month for every extra user account.
              </p>
            </div>
          </div>

          {/* Detailed Feature Table */}
          <div className="mt-16 max-w-5xl mx-auto rounded-[28px] border border-stroke-3/80 dark:border-stroke-7 bg-white dark:bg-background-6 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-stroke-3/60 dark:border-stroke-7 bg-background-2/50 dark:bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-heading-4 font-bold text-secondary dark:text-accent font-interTight">
                  Detailed Feature Comparison
                </h3>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 mt-1">
                  Side-by-side assessment of capabilities, limits, and pricing structures.
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
                    <th className="py-4 px-6">Feature / Capability</th>
                    <th className="py-4 px-6 text-primary dark:text-brand-300 font-extrabold bg-primary/5 dark:bg-primary/10">
                      {BRAND_CONFIG.name}
                    </th>
                    <th className="py-4 px-6">Ahrefs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-3/40 dark:divide-stroke-7/60 text-xs sm:text-sm">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-background-2/40 dark:hover:bg-secondary/20 transition-colors">
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
