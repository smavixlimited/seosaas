import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Target, TrendingUp } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/keyword-research")({
  component: KeywordResearchFeaturePage,
});

function KeywordResearchFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Keyword Intelligence
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
              Uncover High-Value Keywords Your Competitors Missed
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Access real-time search volume, accurate keyword difficulty
              scoring, search intent classification, and intent clustering
              across 180+ global markets.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-xl px-6 font-bold text-white bg-primary"
              >
                Explore Keywords Free
              </Link>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Accurate Search Volume & CPC
              </h3>
              <p className="text-sm text-base-content/70">
                Direct-from-source SERP query volumes, 12-month historical
                seasonality trends, and commercial CPC estimates.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Intent-Based Clustering
              </h3>
              <p className="text-sm text-base-content/70">
                Group thousands of long-tail keywords into unified topical
                clusters to build comprehensive content pillar hubs.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">
                Live Ranking Gap Analysis
              </h3>
              <p className="text-sm text-base-content/70">
                Instantly identify keywords where your top 3 competitors rank on
                Page 1 but your domain has no presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
