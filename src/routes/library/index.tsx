import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Compass,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { getAllStrategies } from "@/lib/content";

export const Route = createFileRoute("/library/")({
  component: StrategyLibraryPage,
});

function StrategyLibraryPage() {
  const allStrategies = getAllStrategies();

  const keywordStrategies = allStrategies.filter(
    (s) =>
      s.slug === "seed-from-conversation" ||
      s.slug === "long-tail-question-mining" ||
      s.slug === "search-intent-mapping" ||
      s.slug === "cluster-topical-hubs" ||
      s.slug === "gsc-programmatic-discovery" ||
      s.slug === "opportunity-sizing-forecasting" ||
      s.slug === "intent-beyond-google" ||
      s.slug === "positioning-to-demand",
  );

  const competitiveStrategies = allStrategies.filter(
    (s) =>
      s.slug === "find-your-real-competitors" ||
      s.slug === "keyword-gap-analysis" ||
      s.slug === "competitor-traffic-estimates" ||
      s.slug === "backlink-gap-analysis",
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              SEO & AEO Playbooks
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              {BRAND_CONFIG.name} Strategy Library
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Practical, step-by-step methodologies for search intent
              classification, topical hub construction, competitor gap mining,
              and AI answer engine dominance.
            </p>
          </div>

          {/* Section 1: Keyword & Intent Mastery */}
          <div className="space-y-6">
            <div className="border-b border-base-300 pb-3">
              <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <Search className="h-6 w-6 text-primary" />
                Keyword & Search Intent Mastery
              </h2>
              <p className="text-xs text-base-content/60 mt-1">
                From harvesting customer conversations to building topical
                clusters with compounding rank velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keywordStrategies.map((strategy) => (
                <Link
                  key={strategy.slug}
                  to="/library/$"
                  params={{ _splat: strategy.slug }}
                  className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Target className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-base-content group-hover:text-primary transition-colors">
                      {strategy.title}
                    </h3>
                    <p className="text-xs text-base-content/70 leading-relaxed line-clamp-3">
                      {strategy.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center text-xs font-bold text-primary">
                    Read Playbook{" "}
                    <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 2: Competitive Intelligence */}
          <div className="space-y-6">
            <div className="border-b border-base-300 pb-3">
              <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-secondary" />
                Competitive Intelligence & Authority Gaps
              </h2>
              <p className="text-xs text-base-content/60 mt-1">
                Extract non-branded keyword gaps, audit authority link profiles,
                and dissect real SERP competitors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {competitiveStrategies.map((strategy) => (
                <Link
                  key={strategy.slug}
                  to="/library/$"
                  params={{ _splat: strategy.slug }}
                  className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-secondary/40 flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="h-9 w-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Compass className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-base-content group-hover:text-secondary transition-colors">
                      {strategy.title}
                    </h3>
                    <p className="text-xs text-base-content/70 leading-relaxed line-clamp-3">
                      {strategy.description}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center text-xs font-bold text-secondary">
                    Read Playbook{" "}
                    <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
