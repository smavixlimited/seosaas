import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Compass, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Our Mission
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              Building the Future of Search & Brand Credibility
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto">
              {BRAND_CONFIG.name} was created with a clear thesis: search has fundamentally evolved beyond ten blue links into Answer Engines and real-time AI knowledge synthesis.
            </p>
          </div>

          <div className="space-y-6 text-base text-base-content/80 leading-relaxed">
            <p>
              For over a decade, legacy SEO tools charged exorbitant monthly subscriptions while providing slow, clunky interfaces and locking basic features behind enterprise gates.
            </p>
            <p>
              At <strong>{BRAND_CONFIG.name}</strong>, we engineered an ultra-fast, modern intelligence engine that bridges traditional technical SEO and Google SERP tracking with cutting-edge Answer Engine Optimization (AEO) for AI search engines like ChatGPT, Perplexity, and Claude.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-2">
              <Compass className="h-6 w-6 text-primary" />
              <h3 className="text-base font-bold text-base-content">Radical Transparency</h3>
              <p className="text-xs text-base-content/70">
                Fair, predictable pricing with zero hidden credit fees or surprise renewal jumps.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-2">
              <Sparkles className="h-6 w-6 text-secondary" />
              <h3 className="text-base font-bold text-base-content">AI-First Architecture</h3>
              <p className="text-xs text-base-content/70">
                Direct model integration and MCP protocol support for developer and agent teams.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-2">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <h3 className="text-base font-bold text-base-content">Enterprise Security</h3>
              <p className="text-xs text-base-content/70">
                GDPR & NDPR compliant data storage, isolated client projects, and SOC2 standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
