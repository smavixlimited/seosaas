import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/skorvia-ai-coach")({
  component: SkorviaAiCoachFeaturePage,
});

export function SkorviaAiCoachFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-black text-primary">
              <Icon icon="solar:cpu-bolt-bold" className="h-4 w-4" />
              <span>
                Autonomous AI Chief Marketing Officer &amp; Search Strategist
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
              Meet Skorvia AI: Your 24/7 In-App Brand Growth Coach
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 leading-relaxed">
              Stop drowning in raw SEO data tables. Skorvia AI continuously
              inspects your rank tracking, Google Search Console clicks,
              backlink profile, and ad readiness to tell you exactly what
              actions to take this week to drive real revenue.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-base w-full sm:w-auto"
              >
                Chat with Skorvia AI Free
              </Link>
              <Link
                to="/pricing"
                className="btn btn-ghost border border-base-300 rounded-2xl px-6 font-bold text-sm w-full sm:w-auto"
              >
                View Plans &amp; Pricing
              </Link>
            </div>
          </div>

          {/* AI Chatbot Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-black text-base-content">
                    Skorvia AI Copilot
                  </h3>
                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Live Context Connected</span>
                  </p>
                </div>
              </div>
              <span className="badge badge-outline text-xs font-bold font-mono">
                Autonomous CMO
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-base-content/85 space-y-1">
                <span className="font-bold text-primary">User</span>
                <p>
                  &ldquo;How can we increase organic demo bookings for our SaaS
                  by 20% next month?&rdquo;
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-base-content/90 space-y-2">
                <span className="font-black text-primary flex items-center gap-1">
                  <span>⚡ Skorvia AI</span>
                </span>
                <p className="leading-relaxed">
                  I analyzed your Google Search Console impressions and
                  identified 3 high-impact opportunities:
                </p>
                <ul className="list-disc list-inside space-y-1 text-base-content/80 font-medium">
                  <li>
                    <strong>Quick Win:</strong> Your pricing page ranks #6 for{" "}
                    <em>&ldquo;enterprise seo software&rdquo;</em> (3,400
                    monthly searches). Updating your meta title to mention
                    &ldquo;Instant Pricing &amp; ROI Calculator&rdquo; can lift
                    CTR by ~4.2%.
                  </li>
                  <li>
                    <strong>Ad Protection:</strong> Your landing page has a
                    64/100 Ad Readiness score because no Meta Pixel or Google
                    conversion tag was detected. Fix this before launching paid
                    ads.
                  </li>
                  <li>
                    <strong>Local Visibility:</strong> Sync your 30 missing
                    directory citations across Apple Maps &amp; Bing Places to
                    capture local commercial queries.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-base-200/50 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-base-content">
              Not Just a Chatbot. A Real Growth Strategist.
            </h2>
            <p className="text-sm text-base-content/70">
              Unlike generic ChatGPT, Skorvia AI has full database context of
              your brand, ranking positions, and technical site health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon
                  icon="solar:checklist-minimalistic-bold"
                  className="h-6 w-6"
                />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Prioritized Weekly Roadmaps
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Receive weekly automated action plans that tell your developers,
                copywriters, and marketers the exact highest-leverage task to
                execute first.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Icon icon="solar:cpu-bolt-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Model Context Protocol (MCP)
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Connect external coding agents (Cursor, Claude Desktop,
                Antigravity) to your live SEO database using our
                high-performance MCP protocol.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Icon icon="solar:chat-round-line-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Plain-English Explanations
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                No convoluted SEO jargon. Every diagnostic is explained with
                clear business rationale, estimated conversion lift, and exact
                step-by-step instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
