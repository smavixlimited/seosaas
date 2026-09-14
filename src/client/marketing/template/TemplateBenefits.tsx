import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

const BENEFITS = [
  {
    icon: "solar:stars-bold-duotone",
    iconBg: "bg-primary/10 text-primary dark:text-brand-300",
    badge: "Revenue Growth",
    feature: "AI & Answer Engine Optimization (AEO)",
    headline: "Get Recommended by ChatGPT, Perplexity & Claude",
    benefit:
      "When enterprise buyers ask AI engines for product recommendations, Skorvia identifies the exact sources AI models cite so you get featured first and capture high-intent buyers ahead of competitors.",
    impactStat: "+340%",
    impactLabel: "AI-Driven Referral Pipeline",
  },
  {
    icon: "solar:swords-bold-duotone",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    badge: "Ad Cost Savings",
    feature: "Cross-Network Competitor Ad Spying",
    headline: "Steal Proven Ad Angles & Creative Copy in Seconds",
    benefit:
      "Stop spending thousands testing unproven ad angles. Spy on winning ad creatives, copy hooks, and landing page funnels across Meta, Google, TikTok, and LinkedIn with estimated active longevity metrics.",
    impactStat: "\$15k+",
    impactLabel: "Saved in Creative Testing Waste",
  },
  {
    icon: "solar:shield-check-bold-duotone",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badge: "Zero Ranking Drops",
    feature: "Actionable Technical Audit Roadmaps",
    headline: "Fix the 5 Critical Flaws Leaking 80% of Your Traffic",
    benefit:
      "Instead of confusing 500-page PDF audit reports, Skorvia gives your developers prioritized, 1-click action tickets that immediately unblock crawl budget, Core Web Vitals, and indexing issues.",
    impactStat: "99.4%",
    impactLabel: "Crawl Issue Resolution Rate",
  },
  {
    icon: "solar:buildings-2-bold-duotone",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    badge: "Agency Scalability",
    feature: "White-Label Client Portals & PDF Audits",
    headline: "Automate 20+ Hours of Monthly Client Reporting",
    benefit:
      "Deliver stunning executive SEO reports under your agency’s custom domain, colors, and logo. Impress high-ticket clients and justify 5-figure monthly retainer fees with automated ROI summaries.",
    impactStat: "20+ Hrs",
    impactLabel: "Saved Per Client Each Month",
  },
];

export function TemplateBenefits() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-background-6 border-y border-stroke-3/60 dark:border-stroke-7 relative">
      <div className="main-container">
        <div className="space-y-16">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-green text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full">
              Engineered for Measurable ROI
            </span>
            <h2 className="text-heading-4 sm:text-heading-3 md:text-heading-2 font-bold text-secondary dark:text-accent tracking-tight font-interTight">
              Turning Advanced SEO Features into Bottom-Line Growth
            </h2>
            <p className="text-tagline-1 text-secondary dark:text-accent leading-relaxed max-w-2xl mx-auto">
              Most SEO tools give you endless graphs with zero direction. Skorvia converts search and ad data into automated, high-impact growth plays.
            </p>
          </div>

          {/* 4 Benefit Master Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BENEFITS.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl border border-stroke-3/80 dark:border-stroke-7 bg-background-2 dark:bg-background-7 p-8 sm:p-10 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/40 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-5">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`size-14 rounded-2xl flex items-center justify-center ${item.iconBg} shadow-inner`}>
                      <Icon icon={item.icon} className="size-8" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white dark:bg-background-6 border border-stroke-3 dark:border-stroke-7 text-secondary dark:text-accent">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-primary dark:text-brand-300 uppercase tracking-wider">
                      {item.feature}
                    </div>
                    <h3 className="text-heading-5 sm:text-heading-4 font-bold text-secondary dark:text-accent tracking-tight font-interTight">
                      {item.headline}
                    </h3>
                    <p className="text-tagline-2 text-secondary dark:text-accent leading-relaxed">
                      {item.benefit}
                    </p>
                  </div>
                </div>

                {/* Impact Stat Footer */}
                <div className="pt-4 border-t border-stroke-3/60 dark:border-stroke-7/60 flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-secondary dark:text-accent font-interTight">
                      {item.impactStat}
                    </div>
                    <div className="text-[11px] text-secondary dark:text-accent font-medium">
                      {item.impactLabel}
                    </div>
                  </div>
                  <Link
                    to="/sign-up"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-brand-300 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Explore Workflow</span>
                    <Icon icon="solar:arrow-right-bold" className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Banner */}
          <div className="rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="text-heading-6 font-bold text-secondary dark:text-accent">
                Ready to replace 4 disconnected tools with Skorvia?
              </h4>
              <p className="text-tagline-2 text-secondary dark:text-accent">
                Full access to keyword discovery, competitor ad spies, AEO monitoring & audit tools.
              </p>
            </div>
            <Link
              to="/sign-up"
              className="btn btn-primary btn-md sm:btn-lg rounded-full font-bold text-white shadow-md shrink-0 px-8"
            >
              Get Started Free &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
