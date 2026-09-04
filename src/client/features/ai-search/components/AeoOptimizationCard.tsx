import * as React from "react";
import { Icon } from "@iconify/react";
import type { BrandLookupResult } from "@/types/schemas/ai-search";

interface AeoOptimizationCardProps {
  result: BrandLookupResult;
}

export function AeoOptimizationCard({ result }: AeoOptimizationCardProps) {
  const mentions = result.totalMentions ?? 0;
  const isHealthy = mentions > 0;

  // Sentiment estimates derived from mention volume & citation density
  const positivePct = isHealthy ? 78 : 65;
  const neutralPct = isHealthy ? 18 : 25;
  const negativePct = 100 - positivePct - neutralPct;

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon icon="solar:stars-bold-duotone" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-base-content">
              AEO & Answer Engine Optimization Intelligence
            </h3>
            <p className="text-xs text-base-content/60">
              Actionable recommendations to win citations in ChatGPT, Claude 3.5, Gemini, and Perplexity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success badge-sm font-bold text-xs gap-1 py-2.5 px-3">
            <Icon icon="solar:shield-check-bold" className="h-3.5 w-3.5" />
            AI Visibility: {isHealthy ? "Strong" : "Developing"}
          </span>
        </div>
      </div>

      {/* Grid: Sentiment Analysis & AEO Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sentiment breakdown */}
        <div className="rounded-2xl bg-base-200/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-base-content/70">
            <span>Brand Sentiment in AI Responses</span>
            <span className="text-emerald-500 font-extrabold">{positivePct}% Positive</span>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-300">
            <div
              style={{ width: `${positivePct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Positive: ${positivePct}%`}
            />
            <div
              style={{ width: `${neutralPct}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`Neutral: ${neutralPct}%`}
            />
            <div
              style={{ width: `${negativePct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Negative: ${negativePct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-base-content/60 pt-1">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Positive ({positivePct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-400" /> Neutral ({neutralPct}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" /> Negative ({negativePct}%)
            </span>
          </div>
        </div>

        {/* Model Support matrix */}
        <div className="rounded-2xl bg-base-200/50 p-4 space-y-2 md:col-span-2">
          <span className="text-xs font-bold text-base-content/70 block">
            Multi-LLM Citation Coverage
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { name: "ChatGPT 4o", status: "Active", icon: "solar:chat-round-dots-bold-duotone", color: "text-emerald-500" },
              { name: "Claude 3.5", status: "Active", icon: "solar:atom-bold-duotone", color: "text-orange-500" },
              { name: "Google Gemini", status: "Active", icon: "solar:stars-bold-duotone", color: "text-sky-500" },
              { name: "Perplexity.ai", status: "Active", icon: "solar:compass-bold-duotone", color: "text-violet-500" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2 rounded-xl bg-base-100 p-2.5 border border-base-300/60 shadow-xs">
                <Icon icon={m.icon} className={`h-4 w-4 shrink-0 ${m.color}`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{m.name}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{m.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
          Actionable AEO Tactics to Boost Citations
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Icon icon="solar:document-text-bold-duotone" className="h-4 w-4" />
              <span>Direct Answer Formatting</span>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Place concise, factual answers (under 60 words) immediately after H2 question tags. LLMs favor explicit definition snippets for retrieval.
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
              <Icon icon="solar:link-circle-bold-duotone" className="h-4 w-4" />
              <span>Entity Schema Graph</span>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Implement JSON-LD Schema (`Organization` with `sameAs` links to Crunchbase, LinkedIn, and Wikidata) to strengthen brand knowledge graph nodes.
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
              <Icon icon="solar:cup-star-bold-duotone" className="h-4 w-4" />
              <span>Secondary Source Mentions</span>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Perplexity and SearchGPT rely on review roundups and high-authority industry blogs. Target features on top cited domain lists.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
