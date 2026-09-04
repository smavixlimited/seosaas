import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, FileCode2, Sparkles, Terminal } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/features/ai-search-aeo")({
  component: AiSearchAeoFeaturePage,
});

function AiSearchAeoFeaturePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Answer Engine Optimization</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content leading-tight">
              Track & Win Citations in ChatGPT, Perplexity & Claude
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Traditional Google rankings are only half the battle. {BRAND_CONFIG.name} tracks where and how Generative AI engines cite your brand, products, and articles.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link to="/sign-up" className="btn btn-primary rounded-xl px-6 font-bold text-white bg-primary">
                Audit Your AI Citations
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">Generative AI Citation Rate</h3>
              <p className="text-sm text-base-content/70">
                Track how often LLMs select your domain as a primary citation source across thousands of synthetic consumer prompts.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <FileCode2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">`llms.txt` Generator & Checker</h3>
              <p className="text-sm text-base-content/70">
                Validate and generate optimized `llms.txt` and `llms-full.txt` files to guide AI crawlers to your most authoritative structured markdown.
              </p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content">MCP Agent Protocol Integration</h3>
              <p className="text-sm text-base-content/70">
                Let your autonomous coding and research agents query your SEO intelligence database directly via the Model Context Protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
