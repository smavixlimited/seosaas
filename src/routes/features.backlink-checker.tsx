import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Globe, Link2 } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/backlink-checker")({
  component: BacklinkCheckerFeaturePage,
});

function BacklinkCheckerFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-secondary/10 px-3.5 py-1 text-xs font-bold text-secondary">
              Backlink Intelligence
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
              Monitor Authority Links & Identify Toxic Backlinks
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Audit referring domains, anchor text distribution, dofollow/nofollow ratios, and lost links with real-time crawler updates.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/sign-up" className="btn btn-primary rounded-xl px-6 font-bold text-white bg-primary">
                Analyze Backlinks Free
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Referring Domain Profiling</h3>
              <p className="text-sm text-base-content/70">
                Track root domain authority, historical link acquisition velocity, and geographical distribution of inbound links.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Link2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Anchor Text Diversity</h3>
              <p className="text-sm text-base-content/70">
                Ensure natural anchor text distribution across branded, exact match, and generic terms to avoid algorithmic penalties.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Lost Link & Disavow Alerts</h3>
              <p className="text-sm text-base-content/70">
                Receive notifications when high-authority links drop or 404, with one-click Google disavow file generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
