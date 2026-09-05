import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/competitor-page-decoder")({
  component: CompetitorPageDecoderFeaturePage,
});

export function CompetitorPageDecoderFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
              <Icon icon="solar:fire-bold" className="h-4 w-4" />
              <span>
                Competitor Intelligence &amp; Content Reverse-Engineering
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
              Reverse-Engineer Any #1 Ranking Competitor Page in Seconds
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 leading-relaxed">
              Stop guessing why your competitors outrank you. Paste any
              competing URL to decode their target keyword frequency, word
              count, readability, heading hierarchy, and internal linking
              strategy instantly.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-base w-full sm:w-auto"
              >
                Decode a Competitor Free
              </Link>
              <Link
                to="/pricing"
                className="btn btn-ghost border border-base-300 rounded-2xl px-6 font-bold text-sm w-full sm:w-auto"
              >
                View Plans &amp; Pricing
              </Link>
            </div>
          </div>

          {/* Page Decoder UI Mockup */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Icon icon="solar:code-file-bold" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-base-content">
                    Competitor Deep Scan
                  </h3>
                  <p className="text-xs text-base-content/60 font-mono">
                    https://competitor.com/complete-seo-guide
                  </p>
                </div>
              </div>
              <span className="badge badge-primary badge-sm font-bold text-xs">
                2,450 Words &bull; Grade A
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[10px] font-bold text-base-content/60 uppercase">
                  Primary Keyword
                </span>
                <div className="text-sm font-black text-base-content truncate">
                  &ldquo;SaaS SEO Strategy&rdquo;
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  2.4% Density (Optimal)
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[10px] font-bold text-base-content/60 uppercase">
                  Reading Grade
                </span>
                <div className="text-sm font-black text-base-content">
                  Grade 8.4
                </div>
                <div className="text-[11px] text-base-content/60 font-medium">
                  Easy reading flow
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[10px] font-bold text-base-content/60 uppercase">
                  Headings (H1-H3)
                </span>
                <div className="text-sm font-black text-base-content">
                  14 Headings
                </div>
                <div className="text-[11px] text-base-content/60 font-medium">
                  Structured hierarchy
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[10px] font-bold text-base-content/60 uppercase">
                  Internal Links
                </span>
                <div className="text-sm font-black text-base-content">
                  28 Links
                </div>
                <div className="text-[11px] text-base-content/60 font-medium">
                  Topic cluster active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-base-200/50 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-base-content">
              Beat Competitors with Scientific Precision
            </h2>
            <p className="text-sm text-base-content/70">
              Eliminate writer&apos;s block and guesswork. Know exactly how many
              words, headings, and internal links you need to overtake page #1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Icon icon="solar:document-text-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Heading &amp; Outline Extraction
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Extract all H1, H2, and H3 subheadings from winning competitor
                pages into an instant content brief ready for your writing team.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon icon="solar:chart-2-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Keyword Density &amp; TF-IDF Analysis
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Identify the exact secondary keywords, co-occurring terms, and
                semantic entities competitors use to satisfy search intent.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Icon icon="solar:link-circle-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Internal Linking Blueprint
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Map out which money pages and feature articles the competitor
                passes internal PageRank to, so you can model a winning topic
                cluster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
