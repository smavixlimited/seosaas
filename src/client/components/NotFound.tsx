import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

const HELPFUL_LINKS = [
  {
    title: "Keyword Intelligence",
    desc: "Discover high-intent buyer terms and keyword difficulty.",
    to: "/features/keyword-research",
    icon: "solar:magnifer-bold-duotone",
    iconBg: "bg-primary/10 text-primary dark:text-brand-300",
  },
  {
    title: "Competitor Ad Spying",
    desc: "Monitor winning Meta, Google, and TikTok ad creatives.",
    to: "/features/competitor-page-decoder",
    icon: "solar:eye-bold-duotone",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "AI & AEO Radar",
    desc: "Track ChatGPT, Perplexity, and Claude brand citations.",
    to: "/features/ai-search-aeo",
    icon: "solar:stars-bold",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Technical Site Audits",
    desc: "Crawl 100+ SEO checkpoints and generate fix roadmaps.",
    to: "/features/site-audit",
    icon: "solar:shield-check-bold-duotone",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
];

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-2 dark:bg-background-5 text-secondary dark:text-accent selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <main className="flex-1 relative pt-[140px] md:pt-[170px] pb-16 overflow-hidden">
        {/* Ambient Radial Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="main-container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs sm:text-tagline-2 font-bold border border-rose-500/20 shadow-xs">
              <span className="size-2 rounded-full bg-rose-500 animate-ping" />
              <span>404 Error &bull; Page Not Found</span>
            </div>

            {/* Giant 404 Display Number */}
            <div className="relative select-none">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-secondary/10 dark:text-accent/10 font-interTight">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-heading-3 sm:text-heading-2 md:text-heading-1 font-bold text-secondary dark:text-accent tracking-tight font-interTight">
                  Lost in Search?
                </h2>
              </div>
            </div>

            {/* Subhead Explanation */}
            <p className="max-w-xl mx-auto text-tagline-1 sm:text-heading-6 text-secondary dark:text-accent font-normal leading-relaxed">
              {children || (
                <>
                  The page you are looking for has been moved, renamed, or does
                  not exist. Let&apos;s get you back to dominating search and AI
                  answer engines.
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/"
                className="btn btn-primary btn-md sm:btn-lg rounded-full font-bold text-white shadow-md gap-2 px-8"
              >
                <Icon icon="solar:home-2-bold" className="size-4" />
                <span>Return to Homepage</span>
              </Link>
              <Link
                to="/pricing"
                className="btn btn-white dark:btn-transparent hover:btn-primary btn-md sm:btn-lg rounded-full font-bold border border-stroke-3 dark:border-stroke-7 gap-2 px-6"
              >
                <Icon icon="solar:tag-price-bold" className="size-4" />
                <span>View Pricing</span>
              </Link>
            </div>

            {/* Helpful Links Grid */}
            <div className="pt-12 text-left">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-secondary dark:text-accent text-center mb-6">
                Popular Search Workflows
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {HELPFUL_LINKS.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.to}
                    className="group flex items-start gap-4 p-4 rounded-2xl border border-stroke-3/70 dark:border-stroke-7 bg-white dark:bg-background-6 shadow-2xs hover:shadow-lg hover:border-primary/40 transition-all duration-200"
                  >
                    <div
                      className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                    >
                      <Icon icon={item.icon} className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-secondary dark:text-accent group-hover:text-primary transition-colors">
                        <span>{item.title}</span>
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="size-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                      <p className="text-xs text-secondary dark:text-accent leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
