import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <span className="badge badge-cyan">Our Mission</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              Building the Future of Search & Brand Credibility
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto">
              {BRAND_CONFIG.name} was created with a clear thesis: search has
              fundamentally evolved beyond ten blue links into Answer Engines
              and real-time AI knowledge synthesis.
            </p>
          </div>

          <div className="rounded-[24px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-8 sm:p-10 space-y-6 text-tagline-1 text-secondary/80 dark:text-accent/80 leading-relaxed shadow-sm">
            <p>
              For over a decade, legacy SEO tools charged exorbitant monthly
              subscriptions while providing slow, clunky interfaces and locking
              basic features behind enterprise gates.
            </p>
            <p>
              At{" "}
              <strong className="text-secondary dark:text-accent">
                {BRAND_CONFIG.name}
              </strong>
              , we engineered an ultra-fast, modern intelligence engine that
              bridges traditional technical SEO and Google SERP tracking with
              cutting-edge Answer Engine Optimization (AEO) for AI search
              engines like ChatGPT, Perplexity, and Claude.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-ns-cyan/15 text-ns-cyan flex items-center justify-center">
                <Icon
                  icon="solar:compass-bold-duotone"
                  className="size-6 text-ns-cyan"
                />
              </div>
              <h3 className="text-heading-6 font-bold font-interTight text-secondary dark:text-accent">
                Radical Transparency
              </h3>
              <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 leading-relaxed">
                Fair, predictable pricing with zero hidden credit fees or
                surprise renewal jumps.
              </p>
            </div>

            <div className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-ns-yellow/15 text-ns-yellow flex items-center justify-center">
                <Icon
                  icon="solar:magic-stick-3-bold-duotone"
                  className="size-6 text-ns-yellow"
                />
              </div>
              <h3 className="text-heading-6 font-bold font-interTight text-secondary dark:text-accent">
                AI-First Architecture
              </h3>
              <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 leading-relaxed">
                Direct model integration and MCP protocol support for developer
                and agent teams.
              </p>
            </div>

            <div className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-ns-green/15 text-ns-green flex items-center justify-center">
                <Icon
                  icon="solar:shield-check-bold-duotone"
                  className="size-6 text-ns-green"
                />
              </div>
              <h3 className="text-heading-6 font-bold font-interTight text-secondary dark:text-accent">
                Enterprise Security
              </h3>
              <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 leading-relaxed">
                GDPR & NDPR compliant data storage, isolated client projects,
                and SOC2 standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
