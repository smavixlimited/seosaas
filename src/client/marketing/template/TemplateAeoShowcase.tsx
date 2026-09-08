import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

const COMPARISON_ROWS = [
  {
    feature: "AI Answer Engine (AEO) Citation Tracking",
    description: "Monitor when ChatGPT, Perplexity, Claude & Google Gemini recommend your brand.",
    skorvia: true,
    skorviaDetail: "Full AEO & Prompt Explorer",
    legacy: false,
    legacyDetail: "Not available",
  },
  {
    feature: "Cross-Network Competitor Ad Spying",
    description: "Spy on winning creatives across Meta, Google Ads, TikTok & LinkedIn.",
    skorvia: true,
    skorviaDetail: "Built-in 4-network library",
    legacy: false,
    legacyDetail: "Requires separate \$149/mo tool",
  },
  {
    feature: "Team Seats & Multi-User Billing",
    description: "Collaborate with your full growth team, copywriters, and developers.",
    skorvia: true,
    skorviaDetail: "Unlimited seats on Pro & Agency",
    legacy: false,
    legacyDetail: "\$199 to \$249/mo per seat",
  },
  {
    feature: "Action-Prioritized Technical Audits",
    description: "Automated fix checklists ranked by revenue & ranking impact.",
    skorvia: true,
    skorviaDetail: "1-Click Developer tickets",
    legacy: false,
    legacyDetail: "Raw 500-row CSV spreadsheet dumps",
  },
  {
    feature: "Agency White-Label Portals & Instant PDF Audits",
    description: "Send professional client reports under your own agency brand.",
    skorvia: true,
    skorviaDetail: "Included in Agency tier",
    legacy: false,
    legacyDetail: "\$449+/mo Enterprise only",
  },
];

export function TemplateAeoShowcase() {
  return (
    <section className="py-20 md:py-28 bg-background-2 dark:bg-background-5 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="main-container">
        <div className="space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full">
              The Next-Generation Advantage
            </span>
            <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent tracking-tight font-interTight">
              Why Modern Growth Teams Choose Skorvia Over Legacy Tools
            </h2>
            <p className="text-tagline-1 text-secondary dark:text-accent leading-relaxed max-w-2xl mx-auto">
              Legacy SEO software was built in 2012 for 10 blue links. Skorvia was built for 2026: AI search engines, multi-network ad intelligence, and zero seat restrictions.
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="rounded-3xl border border-stroke-3/80 dark:border-stroke-7 bg-white dark:bg-background-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stroke-3 dark:border-stroke-7 bg-background-1/80 dark:bg-background-7/80">
                    <th className="py-5 px-6 sm:px-8 text-tagline-2 font-bold text-secondary dark:text-accent w-1/2">
                      Core Capability & Outcome
                    </th>
                    <th className="py-5 px-6 sm:px-8 text-tagline-2 font-bold text-primary dark:text-brand-300 w-1/4 bg-primary/5 dark:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:stars-bold" className="size-5 text-amber-500" />
                        <span>Skorvia Platform</span>
                      </div>
                    </th>
                    <th className="py-5 px-6 sm:px-8 text-tagline-2 font-bold text-secondary dark:text-accent w-1/4">
                      Legacy SEO Tools
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-3/60 dark:divide-stroke-7/60 text-xs sm:text-sm">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-background-2/50 dark:hover:bg-background-7/40 transition-colors"
                    >
                      <td className="py-5 px-6 sm:px-8">
                        <div className="font-bold text-secondary dark:text-accent text-sm sm:text-base">
                          {row.feature}
                        </div>
                        <div className="text-secondary dark:text-accent text-xs sm:text-tagline-3 mt-1 leading-relaxed">
                          {row.description}
                        </div>
                      </td>

                      {/* Skorvia Column */}
                      <td className="py-5 px-6 sm:px-8 bg-primary/5 dark:bg-primary/10 font-bold text-secondary dark:text-accent">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Icon icon="solar:check-circle-bold" className="size-5 shrink-0" />
                          <span className="text-xs sm:text-sm">{row.skorviaDetail}</span>
                        </div>
                      </td>

                      {/* Legacy Column */}
                      <td className="py-5 px-6 sm:px-8 text-secondary dark:text-accent font-medium">
                        <div className="flex items-center gap-2 text-rose-500/80 dark:text-rose-400/80">
                          <Icon icon="solar:close-circle-bold" className="size-5 shrink-0" />
                          <span className="text-xs sm:text-sm">{row.legacyDetail}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Conversion Row */}
          <div className="text-center pt-2 space-y-4">
            <Link
              to="/sign-up"
              className="btn btn-primary btn-xl rounded-full font-bold text-white shadow-xl hover:scale-105 transition-all px-10"
            >
              Claim Your 14-Day Free Trial &rarr;
            </Link>
            <p className="text-xs text-secondary dark:text-accent font-medium">
              No credit card required &bull; Instant setup in under 60 seconds &bull; Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
