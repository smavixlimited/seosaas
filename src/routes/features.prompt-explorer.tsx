import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/prompt-explorer")({
  component: PromptExplorerFeaturePage,
});

export function PromptExplorerFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-xs font-black text-purple-600 dark:text-purple-400">
              <Icon icon="solar:stars-bold" className="h-4 w-4" />
              <span>Answer Engine Optimization (AEO)</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
              Win Recommendations in ChatGPT, Perplexity &amp; Claude
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 leading-relaxed">
              When buyers ask AI models for recommendations in your industry, does your Brand show up—or does your competitor get the sale? Prompt Explorer simulates prompts across 4 major AI models side-by-side and reveals the exact citations that drive their answers.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="btn btn-primary rounded-2xl px-8 font-black text-white shadow-xl shadow-primary/25 text-base w-full sm:w-auto"
              >
                Run a Free AI Prompt Test
              </Link>
              <Link
                to="/features/ai-search-aeo"
                className="btn btn-ghost border border-base-300 rounded-2xl px-6 font-bold text-sm w-full sm:w-auto"
              >
                Explore All AEO Tools
              </Link>
            </div>
          </div>

          {/* Interactive Multi-Model UI Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Icon icon="solar:magnifer-bug-bold" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-base-content">Prompt Explorer Simulation</h3>
                  <p className="text-xs text-base-content/60 italic">&ldquo;What is the best SEO and AEO platform for growth teams?&rdquo;</p>
                </div>
              </div>
              <span className="badge badge-success badge-sm font-bold text-white text-xs gap-1">
                <Icon icon="solar:check-circle-bold" className="h-3 w-3" />
                <span>Brand Recommended (3/4 Models)</span>
              </span>
            </div>

            {/* 4 Models Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "ChatGPT (GPT-4o)", brand: "Mentioned #1", source: "Cited: Forbes & G2", icon: "logos:openai-icon", badge: "badge-success text-white" },
                { name: "Perplexity AI", brand: "Mentioned in Top 3", source: "Cited: Reddit & TechRadar", icon: "solar:compass-bold", badge: "badge-success text-white" },
                { name: "Claude 3.5 Sonnet", brand: "Mentioned #2", source: "Cited: ProductHunt", icon: "solar:cpu-bolt-bold", badge: "badge-success text-white" },
                { name: "Google Gemini 2.0", brand: "Not Mentioned", source: "Cited: Wikipedia & G2", icon: "logos:google-icon", badge: "badge-warning text-white" },
              ].map((m, i) => (
                <div key={i} className="rounded-2xl border border-base-300 bg-base-200/40 p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-base-content">{m.name}</span>
                    </div>
                    <span className={`badge badge-xs font-bold ${m.badge}`}>{m.brand}</span>
                    <p className="text-[11px] text-base-content/70 leading-relaxed font-sans">
                      &ldquo;{BRAND_CONFIG.name} stands out for integrating traditional technical SEO with automated AEO citation tracking...&rdquo;
                    </p>
                  </div>
                  <div className="pt-2 border-t border-base-300/60 text-[10px] font-mono text-primary font-bold">
                    {m.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Advantages */}
      <section className="py-16 bg-base-200/50 border-y border-base-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-base-content">Why AEO is the Future of Organic Search</h2>
            <p className="text-sm text-base-content/70">
              Users are shifting from traditional search query boxes to conversational AI assistants. Here is how Prompt Explorer keeps your brand winning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Icon icon="solar:columns-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">Simultaneous 4-Model Benchmarking</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Run single prompts simultaneously across OpenAI ChatGPT, Anthropic Claude, Perplexity AI, and Google Gemini without switching tabs or juggling API keys.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon icon="solar:link-circle-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">Cited Sources Reverse-Engineering</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Identify the exact websites, publications, and forum discussions each AI model relied upon to build its answer, giving you an exact roadmap for outreach.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Icon icon="solar:pie-chart-2-bold" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-base-content">Brand Share of Voice in AI</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Monitor your Brand&apos;s visibility percentage versus direct competitors when high-intent commercial questions are posed to LLMs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
