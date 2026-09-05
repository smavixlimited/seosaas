import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/")({
  component: FeaturesIndexPage,
});

export function FeaturesIndexPage() {
  const featureCategories = [
    {
      category: "Core SEO & Rank Intelligence",
      description:
        "Everything you need to dominate Google search results and uncover competitor traffic sources.",
      items: [
        {
          name: "Keyword Research",
          benefit:
            "Find high-volume, low-competition buyer keywords with precise intent mapping and live SERP difficulty.",
          href: "/features/keyword-research",
          icon: "solar:magnifer-bold",
          color: "text-primary bg-primary/10",
        },
        {
          name: "Backlink Explorer",
          benefit:
            "Audit referring domains, anchor texts, toxic links, and claim competitor link gaps to build unstoppable domain authority.",
          href: "/features/backlink-checker",
          icon: "solar:link-circle-bold",
          color: "text-blue-500 bg-blue-500/10",
        },
        {
          name: "Technical Site Audit",
          benefit:
            "Crawl your site to detect broken links, crawlability blockers, Core Web Vitals, and on-page technical health.",
          href: "/features/site-audit",
          icon: "solar:shield-check-bold",
          color: "text-emerald-500 bg-emerald-500/10",
        },
      ],
    },
    {
      category: "AEO, AI Search & Conversion Optimization",
      description:
        "Next-generation capabilities to capture AI answer engines and protect paid ad conversion rates.",
      items: [
        {
          name: "Conversion & Ad Readiness (0–100)",
          benefit:
            "Pre-flight audit for sales pages. Catch conversion leaks, copy friction, and audit Meta & Google tracking pixels before launching ads.",
          href: "/features/conversion-ad-readiness",
          icon: "solar:chart-square-bold",
          color: "text-emerald-600 bg-emerald-500/10",
        },
        {
          name: "Prompt Explorer & AEO",
          benefit:
            "Simulate buyer prompts across ChatGPT, Perplexity, Claude, and Gemini side-by-side to see recommendations and cited sources.",
          href: "/features/prompt-explorer",
          icon: "solar:stars-bold",
          color: "text-purple-600 bg-purple-500/10",
        },
        {
          name: "Competitor Page Decoder",
          benefit:
            "Steal your competitor's ranking playbook in 5 seconds. Uncover their target keywords, content structure, and internal link strategy.",
          href: "/features/competitor-page-decoder",
          icon: "solar:fire-bold",
          color: "text-amber-600 bg-amber-500/10",
        },
      ],
    },
    {
      category: "Local Business & Agency Scale",
      description:
        "Tools engineered for multi-location brands, local storefronts, and digital marketing agencies.",
      items: [
        {
          name: "Local Business & GBP Sync",
          benefit:
            "1-Click Google OAuth detection, presence audit across 33 global directories, and in-store review generation QR kits.",
          href: "/features/local-business",
          icon: "solar:shop-2-bold",
          color: "text-indigo-600 bg-indigo-500/10",
        },
        {
          name: "Skorvia AI Brand Coach",
          benefit:
            "Your 24/7 in-house CMO and search strategist that analyzes your live search data and provides prioritized weekly action roadmaps.",
          href: "/features/skorvia-ai-coach",
          icon: "solar:cpu-bolt-bold",
          color: "text-primary bg-primary/10",
        },
        {
          name: "White-Label Client Reports",
          benefit:
            "Generate presentation-ready, white-labeled client PDF audit reports customized with your agency logo, brand colors, and disclaimers.",
          href: "/features/white-label-reports",
          icon: "solar:document-text-bold",
          color: "text-rose-600 bg-rose-500/10",
        },
        {
          name: "24/7 Uptime & SSL Monitoring",
          benefit:
            "Proactive server heartbeat checks, SSL expiration tracking, and instant alerts before silent downtime damages your rankings.",
          href: "/features/uptime-monitoring",
          icon: "solar:radar-bold",
          color: "text-cyan-600 bg-cyan-500/10",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Header */}
      <section className="py-16 sm:py-24 border-b border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black text-primary">
            Platform Capabilities
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
            The Complete SEO, AEO &amp; Conversion Growth Suite
          </h1>
          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Explore our comprehensive suite of modern organic growth tools built
            for brands, agencies, and ambitious founders.
          </p>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {featureCategories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-base-content">
                  {cat.category}
                </h2>
                <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
                  {cat.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color} transition-transform group-hover:scale-105`}
                      >
                        <Icon icon={item.icon} className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-black text-base-content group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{item.name}</span>
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                        />
                      </h3>
                      <p className="text-xs text-base-content/70 leading-relaxed">
                        {item.benefit}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-base-200 text-xs font-bold text-primary flex items-center gap-1">
                      <span>Explore dedicated feature</span>
                      <Icon icon="solar:arrow-right-bold" className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Accelerate Your Organic Traffic &amp; Revenue?
          </h2>
          <p className="text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Create your account today and experience all tools free with 500
            initial credits.
          </p>
          <div>
            <Link
              to="/sign-up"
              className="btn btn-neutral bg-white text-primary border-none hover:bg-white/90 rounded-2xl px-8 font-black text-base shadow-xl"
            >
              Start Free Today
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
