import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/solutions/for-ecommerce")({
  component: ForEcommercePage,
});

function ForEcommercePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Icon icon="solar:cart-large-bold" className="h-4 w-4" />
              <span>Built for Shopify, WooCommerce & E-Commerce Brands</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Rank Product Pages. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-primary to-secondary bg-clip-text text-transparent">
                Drive Organic Buyer Traffic.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-base-content/70 font-medium max-w-2xl mx-auto leading-relaxed">
              Paid ads CAC is skyrocketing. Scale free organic traffic to thousands of product SKUs with deep technical site crawls, broken link detectors, and long-tail transactional keyword tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-sm"
              >
                Audit Your Store Free &rarr;
              </Link>
              <Link
                to="/pricing"
                className="btn btn-ghost rounded-2xl px-6 font-bold text-sm"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-base-200/40 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black tracking-tight">
              E-Commerce SEO That Converts Shoppers into Revenue
            </h2>
            <p className="text-sm text-base-content/70">
              Stop losing sales to out-of-stock 404s, slow mobile speeds, and duplicate collection URLs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "solar:layers-bold",
                title: "Deep Catalog Crawler",
                desc: "Scan thousands of product pages in minutes for missing alt tags, duplicate meta descriptions, canonical mismatches, and broken redirect chains.",
              },
              {
                icon: "solar:cart-bold",
                title: "Transactional Keyword Explorer",
                desc: "Discover high-converting 'buy now' and product comparison search terms with exact search volumes and CPC estimates.",
              },
              {
                icon: "solar:bolt-bold",
                title: "Instant IndexNow Submissions",
                desc: "Push new product launches, flash sales, and updated inventory directly to search engines the instant you hit publish.",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Icon icon={card.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base text-base-content">{card.title}</h3>
                <p className="text-xs text-base-content/70 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
