import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/conversion-ad-readiness")({
  component: ConversionAdReadinessFeaturePage,
});

export function ConversionAdReadinessFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <Icon icon="solar:shield-check-bold" className="h-4 w-4" />
              <span>Conversion Rate Optimization &amp; Ad Protection</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
              Stop Bleeding Ad Spend on Broken Landing Pages
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 leading-relaxed">
              Before you spend a single dollar on Meta, Google, TikTok, or
              LinkedIn ads, run a pre-flight 0–100 audit. Catch hidden checkout
              leaks, copy friction, and ensure your tracking pixels are firing
              properly.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-base w-full sm:w-auto"
              >
                Scan Your Landing Page Free
              </Link>
              <Link
                to="/pricing"
                className="btn btn-ghost border border-base-300 rounded-2xl px-6 font-bold text-sm w-full sm:w-auto"
              >
                Explore Pricing Plans
              </Link>
            </div>
          </div>

          {/* Interactive Scorecard Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-2xl ring-1 ring-emerald-500/20">
                  88
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-base-content">
                      Ready for Paid Traffic
                    </h3>
                    <span className="badge badge-success badge-sm font-bold text-white text-[10px]">
                      Grade A
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 font-mono">
                    https://yourbrand.com/pricing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-outline text-xs font-bold gap-1 py-3 px-3">
                  <Icon
                    icon="solar:shield-check-bold"
                    className="h-3.5 w-3.5 text-emerald-500"
                  />
                  <span>Ad Spend Risk: Low</span>
                </span>
              </div>
            </div>

            {/* 6 Sub-Pillars Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Ad Pixels & Tracking",
                  score: "100/100",
                  status: "Meta & Google Active",
                  icon: "solar:radar-bold",
                  color: "text-emerald-500",
                },
                {
                  title: "CTA & Offer Clarity",
                  score: "88/100",
                  status: "Above-the-fold CTA",
                  icon: "solar:bolt-bold",
                  color: "text-primary",
                },
                {
                  title: "Trust & Credibility",
                  score: "92/100",
                  status: "SSL & Privacy Verified",
                  icon: "solar:shield-star-bold",
                  color: "text-blue-500",
                },
                {
                  title: "Mobile & Page Speed",
                  score: "84/100",
                  status: "1.2s LCP on Mobile",
                  icon: "solar:stopwatch-bold",
                  color: "text-amber-500",
                },
                {
                  title: "Social Proof",
                  score: "86/100",
                  status: "Reviews & Badges",
                  icon: "solar:star-bold",
                  color: "text-purple-500",
                },
                {
                  title: "Checkout & Form Length",
                  score: "80/100",
                  status: "Frictionless 2-Field",
                  icon: "solar:cart-check-bold",
                  color: "text-indigo-500",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-base-300 bg-base-200/40 p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Icon icon={p.icon} className={`h-5 w-5 ${p.color}`} />
                    <span className="font-black text-xs font-mono">
                      {p.score}
                    </span>
                  </div>
                  <div className="font-black text-xs text-base-content">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-base-content/60 font-medium">
                    {p.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-16 bg-base-200/50 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-base-content">
              Why Pre-Ad Audits Pay for Themselves
            </h2>
            <p className="text-sm text-base-content/70">
              Driving paid ad traffic without conversion tracking blinds ad
              algorithms and drains marketing budgets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Icon icon="solar:radar-2-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Automated Pixel Health Scanner
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Automatically scans for Meta Pixel, Google Ads Conversion Tag,
                Google Tag Manager, TikTok, LinkedIn, and GA4 to ensure your
                purchase events fire correctly.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon icon="solar:danger-triangle-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Critical Friction Diagnostics
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Highlights high-friction roadblocks like overly long checkout
                forms, hidden pricing, unclear value propositions, and slow
                mobile viewport shifts.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Icon icon="solar:stars-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                1-Click AI Fix Recommendations
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Receive prioritized, high-lift copywriting adjustments and
                conversion tweaks formulated by Skorvia AI to double your
                conversion rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-base-content">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Why does missing pixel tracking cause high ad costs?",
                a: "Meta (Advantage+) and Google Smart Bidding require conversion data to train their machine learning models. Without active pixel tags, they cannot identify who bought, causing you to pay for useless clicks that never convert.",
              },
              {
                q: "How does the 0–100 score work?",
                a: "The scorecard weighs 6 conversion pillars: Ad Pixels & Tracking, CTA & Offer Clarity, Trust & Credibility, Mobile & Page Speed, Social Proof, and Form/Checkout Friction. Scores above 80 indicate high readiness for paid traffic.",
              },
              {
                q: "Can I audit client landing pages as an agency?",
                a: "Yes! You can audit any public landing page or competitor URL without needing access to their source code or CMS.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-base-300 bg-base-100 p-5 space-y-1.5"
              >
                <h4 className="font-black text-sm text-base-content">
                  {faq.q}
                </h4>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  {faq.a}
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
