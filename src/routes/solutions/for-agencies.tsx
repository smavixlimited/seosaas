import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/solutions/for-agencies")({
  component: ForAgenciesPage,
});

function ForAgenciesPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
              <Icon
                icon="solar:users-group-two-rounded-bold"
                className="h-4 w-4"
              />
              <span>Built for Growth, SEO & Digital Marketing Agencies</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Scale Client SEO Retainers. <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
                Cut Software Overhead by 70%.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-base-content/70 font-medium max-w-2xl mx-auto leading-relaxed">
              Managing 20+ client domains on legacy \$499/mo agency tiers is
              burning your margins. {BRAND_CONFIG.name} delivers unlimited
              client projects, automated white-label PDF reports, and read-only
              client access.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-sm"
              >
                Start Agency Free Trial &rarr;
              </Link>
              <Link
                to="/pricing"
                className="btn btn-ghost rounded-2xl px-6 font-bold text-sm"
              >
                View Agency Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Features Bento Grid */}
      <section className="py-16 bg-base-200/40 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black tracking-tight">
              Everything Your Agency Needs to Win & Retain Clients
            </h2>
            <p className="text-sm text-base-content/70">
              Deliver institutional-grade SEO campaigns without complex
              enterprise contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "solar:document-text-bold",
                title: "Automated White-Label PDFs",
                desc: "Schedule branded weekly or monthly audit & rank performance reports sent directly to your clients with your agency logo and colors.",
              },
              {
                icon: "solar:shield-user-bold",
                title: "Client Read-Only Portals",
                desc: "Invite clients as 'Viewers' to their own dedicated domain dashboard with zero risk of them modifying keywords or consuming credits.",
              },
              {
                icon: "solar:map-point-wave-bold",
                title: "Map Rank Geo-Grid & Local GBP",
                desc: "Show local brick-and-mortar clients exact ranking pins across their service areas with visual color-coded heatmaps.",
              },
              {
                icon: "solar:stars-bold",
                title: "AEO AI Visibility Tracking",
                desc: "Be the first agency offering AI Search Optimization reports for ChatGPT, Perplexity, and Claude citations.",
              },
              {
                icon: "solar:bolt-bold",
                title: "Instant IndexNow Studio",
                desc: "Push new client blog posts and landing pages to Bing & Google indexes in seconds instead of waiting weeks.",
              },
              {
                icon: "solar:chat-round-dots-bold",
                title: "SAM AI Agency Copilot",
                desc: "Query live DataForSEO APIs directly in natural language to generate instant client audit summaries and pitch decks.",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-base-300 bg-base-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon icon={card.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base text-base-content">
                  {card.title}
                </h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
