import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/local-business")({
  component: LocalBusinessFeaturePage,
});

export function LocalBusinessFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-black text-blue-600 dark:text-blue-400">
              <Icon icon="solar:shop-2-bold" className="h-4 w-4" />
              <span>Local SEO &amp; Google Maps Growth Suite</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
              Dominate Google Maps &amp; 33 Global Directories in 1-Click
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 leading-relaxed">
              Connect your Google Business Profile without tedious manual forms. Audit your local search presence across Apple Maps, Bing, Waze, and Yelp, fix citation errors, and generate 5-star customer reviews automatically.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-base w-full sm:w-auto"
              >
                Sync Google Business Free
              </Link>
              <Link
                to="/pricing"
                className="btn btn-ghost border border-base-300 rounded-2xl px-6 font-bold text-sm w-full sm:w-auto"
              >
                View Plans &amp; Pricing
              </Link>
            </div>
          </div>

          {/* Semrush-Style Local Dashboard Preview */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[11px] font-bold text-base-content/60 uppercase">Online Presence</span>
                <div className="text-xl font-black text-amber-500 flex items-center gap-1.5">
                  <Icon icon="solar:shield-warning-bold" className="h-5 w-5" />
                  <span>Fair</span>
                </div>
                <p className="text-xs text-base-content/60">Visible across 3 of 33 directories</p>
              </div>

              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[11px] font-bold text-base-content/60 uppercase">Listings to Fix</span>
                <div className="text-xl font-black text-primary flex items-center gap-1.5">
                  <Icon icon="solar:wrench-bold" className="h-5 w-5" />
                  <span>30 / 33</span>
                </div>
                <p className="text-xs text-base-content/60">Missing on Apple Maps, Waze, Yelp</p>
              </div>

              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 space-y-1">
                <span className="text-[11px] font-bold text-base-content/60 uppercase">Review Rating</span>
                <div className="text-xl font-black text-base-content flex items-center gap-1.5">
                  <span className="text-amber-500">⭐</span>
                  <span>4.9 / 5.0</span>
                </div>
                <p className="text-xs text-base-content/60">AI auto-response active</p>
              </div>
            </div>

            {/* 33 Directories Preview */}
            <div className="rounded-2xl border border-base-300 bg-base-200/30 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-base-content">
                <span>Fix these to expand coverage:</span>
                <span className="text-primary font-mono">33 Directories Monitored</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {["Google Business Profile", "Apple Maps", "Bing Places", "Facebook Local", "Waze", "Yelp", "Instagram Location", "Siri Search"].map((dir, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-base-100 border border-base-300">
                    <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate font-semibold text-[11px]">{dir}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-base-200/50 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-base-content">Built to Win Local Pack Rankings</h2>
            <p className="text-sm text-base-content/70">
              Stop updating directories one by one. Maintain 100% NAP consistency and win the top 3-pack on Google Maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Icon icon="logos:google-icon" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">1-Click Google OAuth Sync</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Connect your Google Business Profile via OAuth with zero manual typing. Automatically detects all branch locations managed by your Google account.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon icon="solar:qr-code-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">Review Generation QR Center</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Generate high-converting printable QR code table tents, flyers, and ready-to-send SMS templates that route customers directly to your 5-star review link.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Icon icon="solar:chat-line-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">AI Review Responder</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Respond to customer reviews with intelligent, personalized, SEO-friendly replies published live to Google Maps with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
