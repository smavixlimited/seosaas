import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, TrendingUp, X, Zap } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/vs-ahrefs-semrush")({
  component: ComparisonPage,
});

function ComparisonPage() {
  const comparisonData = [
    {
      metric: "Starting Monthly Price",
      skorvia: "$29 / mo",
      ahrefs: "$129 / mo",
      semrush: "$139.95 / mo",
      winner: "skorvia",
    },
    {
      metric: "AI Search & AEO (ChatGPT & Perplexity)",
      skorvia: true,
      ahrefs: false,
      semrush: false,
      winner: "skorvia",
    },
    {
      metric: "MCP Agent Tool Protocol Support",
      skorvia: true,
      ahrefs: false,
      semrush: false,
      winner: "skorvia",
    },
    {
      metric: "Instant IndexNow API Submissions",
      skorvia: true,
      ahrefs: false,
      semrush: false,
      winner: "skorvia",
    },
    {
      metric: "Keyword Research & SERP Volume",
      skorvia: true,
      ahrefs: true,
      semrush: true,
      winner: "tie",
    },
    {
      metric: "Backlink Explorer & Referring Domains",
      skorvia: true,
      ahrefs: true,
      semrush: true,
      winner: "tie",
    },
    {
      metric: "Technical Site Audit & Core Web Vitals",
      skorvia: true,
      ahrefs: true,
      semrush: true,
      winner: "tie",
    },
    {
      metric: "White-Label Agency PDF Reports",
      skorvia: "Included in Agency ($199)",
      ahrefs: "Enterprise ($999+)",
      semrush: "Agency Add-on (+$249)",
      winner: "skorvia",
    },
    {
      metric: "Credit Expiration / Overage Fees",
      skorvia: "Fair predictable limits",
      ahrefs: "Strict credit paywall",
      semrush: "Strict credit paywall",
      winner: "skorvia",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Head-to-Head Comparison
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              {BRAND_CONFIG.name} vs. Ahrefs vs. Semrush
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Why modern founders, agencies, and high-growth brands are choosing {BRAND_CONFIG.name} over bloated legacy tools.
            </p>
          </div>

          {/* Highlight Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xs">
              <div className="flex items-center gap-3 text-primary font-bold">
                <TrendingUp className="h-5 w-5" />
                <span>Save Up To 70% Annually</span>
              </div>
              <p className="text-xs text-base-content/70 mt-2 leading-relaxed">
                Legacy tools charge \$1,500 - \$5,000+ every year with punitive credit limits. {BRAND_CONFIG.name} provides clean, affordable tiering.
              </p>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xs">
              <div className="flex items-center gap-3 text-secondary font-bold">
                <Sparkles className="h-5 w-5" />
                <span>First-Class AI/AEO Tracking</span>
              </div>
              <p className="text-xs text-base-content/70 mt-2 leading-relaxed">
                Track your citations and rankings in ChatGPT, Perplexity, and Claude search responses—capabilities legacy tools ignore.
              </p>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xs">
              <div className="flex items-center gap-3 text-accent font-bold">
                <Zap className="h-5 w-5" />
                <span>AI Agent Integration (MCP)</span>
              </div>
              <p className="text-xs text-base-content/70 mt-2 leading-relaxed">
                Connect your AI agents directly into your live SEO database using the Model Context Protocol (MCP) server.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-14 max-w-5xl mx-auto overflow-x-auto rounded-3xl border border-base-300 bg-base-100 shadow-xl">
            <table className="table w-full text-left">
              <thead>
                <tr className="border-b border-base-300 bg-base-200/60">
                  <th className="py-4 px-6 text-sm font-bold text-base-content">Feature & Metric</th>
                  <th className="py-4 px-4 text-sm font-extrabold text-center text-primary bg-primary/5">
                    {BRAND_CONFIG.name}
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-center text-base-content/70">Ahrefs</th>
                  <th className="py-4 px-4 text-sm font-bold text-center text-base-content/70">Semrush</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-base-200/30">
                    <td className="py-4 px-6 text-sm font-semibold text-base-content">
                      {row.metric}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-center text-primary bg-primary/5">
                      {typeof row.skorvia === "boolean" ? (
                        <Check className="h-5 w-5 text-accent mx-auto" />
                      ) : (
                        row.skorvia
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-base-content/70">
                      {typeof row.ahrefs === "boolean" ? (
                        row.ahrefs ? (
                          <Check className="h-4 w-4 text-base-content/60 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-base-content/30 mx-auto" />
                        )
                      ) : (
                        row.ahrefs
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-base-content/70">
                      {typeof row.semrush === "boolean" ? (
                        row.semrush ? (
                          <Check className="h-4 w-4 text-base-content/60 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-base-content/30 mx-auto" />
                        )
                      ) : (
                        row.semrush
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center space-y-4">
            <h3 className="text-2xl font-black text-base-content">
              Switch to {BRAND_CONFIG.name} today.
            </h3>
            <p className="text-sm text-base-content/70 max-w-md mx-auto">
              Migration takes less than 2 minutes. Import your existing keyword and domain lists effortlessly.
            </p>
            <div className="pt-2">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-bold text-white bg-primary hover:bg-primary/90 border-none shadow-lg shadow-primary/25"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
