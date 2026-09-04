import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge, Layers, Wrench } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/site-audit")({
  component: SiteAuditFeaturePage,
});

function SiteAuditFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Technical Audit Engine
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
              Fix Crawl Errors & Core Web Vitals Before They Hurt Rankings
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              High-speed cloud crawlers inspect your entire website for broken links, duplicate content, slow TTFB, missing metadata, and schema flaws.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/sign-up" className="btn btn-primary rounded-xl px-6 font-bold text-white bg-primary">
                Run Site Audit Free
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Lighthouse & Core Web Vitals</h3>
              <p className="text-sm text-base-content/70">
                Measure real-world LCP, INP, and CLS performance metrics on mobile and desktop devices.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Canonical & Metadata Check</h3>
              <p className="text-sm text-base-content/70">
                Detect missing title tags, orphan pages, infinite redirect loops, and self-referencing canonical issues.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Actionable Fix Recommendations</h3>
              <p className="text-sm text-base-content/70">
                Prioritized issue lists categorizing errors into Critical, Warnings, and Notices with step-by-step code fixes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
