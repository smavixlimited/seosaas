import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export function TemplateFeatures() {
  return (
    <section className="bg-base-200/40 dark:bg-[#0f1217] py-20 lg:py-28 border-y border-base-300 dark:border-white/5">
      <div className="main-container">
        <div className="flex flex-col items-center space-y-12 lg:space-y-16">
          {/* Header */}
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <div className="badge-green">
              <Icon icon="solar:stars-bold" className="h-3.5 w-3.5" />
              <span>Core Revenue Drivers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-base-content leading-tight">
              The 3 Pillars That Actually Move The Needle.
            </h2>
            <p className="text-base text-base-content/70 font-medium">
              We eliminated the 50 confusing submenus of legacy SEO tools. Skorvia is laser-focused on the three highest-ROI organic growth channels.
            </p>
          </div>

          {/* 3-Card Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
            {/* Card 1: Competitor Ad Spying */}
            <article className="group relative h-[500px] w-full overflow-hidden rounded-[24px] bg-base-100 dark:bg-[#13171e] border border-base-300 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:shadow-2xl">
              <div className="space-y-3 z-10">
                <span className="badge badge-sm badge-outline font-bold text-primary dark:text-brand-300">
                  Ad Intelligence
                </span>
                <h3 className="text-2xl font-black text-base-content">
                  Multi-Network Ad Spying
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-medium">
                  Spy on winning Meta, Google, TikTok, and LinkedIn ad creatives from any competitor. 0 user ad accounts needed.
                </p>
              </div>

              {/* Tilted Floating Card (-7deg) */}
              <div className="relative mt-4 h-[240px] w-full flex items-center justify-center">
                <div className="absolute w-[90%] rounded-2xl bg-base-200 dark:bg-[#181d26] border border-base-300 dark:border-white/10 p-5 shadow-xl -rotate-3 group-hover:rotate-0 transition-transform duration-500 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-600/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <Icon icon="solar:video-frame-bold" className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-base-content">Competitor Winning Ad</div>
                        <div className="text-[10px] text-base-content/50">Meta & Google Network</div>
                      </div>
                    </div>
                    <span className="badge badge-success badge-xs font-bold text-white">Active 45+ Days</span>
                  </div>

                  <p className="text-xs font-medium text-base-content/80 italic">
                    "Tired of losing organic traffic? Here's the 3-step growth framework top founders use..."
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-base-300/60 dark:border-white/5 text-[11px] font-semibold text-primary">
                    <span>Angle: Problem-Agitate-Solve</span>
                    <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <div className="pt-2 z-10 flex items-center justify-between text-xs font-bold text-base-content/60">
                <span>4 Networks Supported</span>
                <Link to="/features/competitor-page-decoder" className="text-primary hover:underline flex items-center gap-1">
                  <span>Explore Spy Tool</span>
                  <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            {/* Card 2: Revenue & Traffic Growth */}
            <article className="group relative h-[500px] w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-primary/10 to-indigo-900/10 dark:bg-[#13171e] border border-primary/20 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:shadow-2xl">
              <div className="space-y-3 z-10">
                <span className="badge badge-sm badge-primary font-bold text-white">
                  Organic Traffic Scale
                </span>
                <h3 className="text-2xl font-black text-base-content">
                  Revenue Leak Recovery
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-medium">
                  Identify high-intent keywords ranking in positions 11-20 that can be quickly pushed to Page 1 for immediate sales.
                </p>
              </div>

              {/* Bar Chart Visualization */}
              <div className="relative mt-4 h-[240px] w-full flex flex-col justify-end p-4 rounded-2xl bg-base-100/90 dark:bg-[#0f1217]/90 border border-base-300 dark:border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold text-base-content/60">Estimated Monthly Revenue</div>
                    <div className="text-xl font-black text-emerald-500">+$14,850/mo</div>
                  </div>
                  <span className="badge badge-sm badge-outline font-bold text-emerald-600 dark:text-emerald-400">
                    +185% Growth
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2 h-28 pt-2">
                  {[
                    { h: "h-8", label: "W1" },
                    { h: "h-12", label: "W2" },
                    { h: "h-16", label: "W3" },
                    { h: "h-20", label: "W4" },
                    { h: "h-24", label: "W5" },
                    { h: "h-28", label: "W6", highlight: true },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${bar.h} ${
                          bar.highlight
                            ? "bg-gradient-to-t from-primary to-emerald-400 shadow-md"
                            : "bg-primary/30 dark:bg-white/10"
                        }`}
                      />
                      <span className="text-[10px] font-bold text-base-content/50">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 z-10 flex items-center justify-between text-xs font-bold text-base-content/60">
                <span>Real-Time Daily Refresh</span>
                <Link to="/features/keyword-research" className="text-primary hover:underline flex items-center gap-1">
                  <span>Explore Keywords</span>
                  <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            {/* Card 3: AI Search & AEO Citation Radar */}
            <article className="group relative h-[500px] w-full overflow-hidden rounded-[24px] bg-base-100 dark:bg-[#13171e] border border-base-300 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:shadow-2xl">
              <div className="space-y-3 z-10">
                <span className="badge badge-sm badge-outline font-bold text-indigo-600 dark:text-indigo-400">
                  AI & AEO Radar
                </span>
                <h3 className="text-2xl font-black text-base-content">
                  AI Answer Engine Citations
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-medium">
                  Ensure ChatGPT, Perplexity, and Claude cite and recommend your product when buyers ask for recommendations.
                </p>
              </div>

              {/* Tilted Floating Card (+7deg) */}
              <div className="relative mt-4 h-[240px] w-full flex items-center justify-center">
                <div className="absolute w-[90%] rounded-2xl bg-base-200 dark:bg-[#181d26] border border-base-300 dark:border-white/10 p-5 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-600/20 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <Icon icon="solar:stars-bold" className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-base-content">Perplexity Live Query</div>
                        <div className="text-[10px] text-base-content/50">"Best SEO software for SaaS"</div>
                      </div>
                    </div>
                    <span className="badge badge-info badge-xs font-bold text-white">#1 Source</span>
                  </div>

                  <div className="rounded-lg bg-base-100 dark:bg-black/40 p-2.5 text-xs font-medium text-base-content/90 border border-base-300/40 dark:border-white/5">
                    "According to live benchmarks, <strong className="text-primary font-bold">Skorvia</strong> offers the highest ROI with built-in competitor ad spying..."
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-base-300/60 dark:border-white/5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Cited in 4 Engine Models</span>
                    <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <div className="pt-2 z-10 flex items-center justify-between text-xs font-bold text-base-content/60">
                <span>Perplexity • ChatGPT • Claude</span>
                <Link to="/features/ai-search-aeo" className="text-primary hover:underline flex items-center gap-1">
                  <span>Explore AEO</span>
                  <Icon icon="solar:arrow-right-linear" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
