import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  ChevronRight,
  Code2,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/docs/")({
  component: DocsIndexPage,
});

function DocsIndexPage() {
  const docCategories = [
    {
      title: "Model Context Protocol (MCP)",
      description: "Connect Skorvia directly to Claude Code, Cursor, Windsurf, and custom AI agents to query your live SEO data.",
      href: "/docs/mcp",
      icon: Bot,
      badge: "AI Native",
    },
    {
      title: "SEO Agent Skills",
      description: "Pre-built autonomous prompt & tool workflows for audits, keyword clustering, and link outreach.",
      href: "/docs/skills",
      icon: Sparkles,
      badge: "10 Workflows",
    },
    {
      title: "Claude Code Plugin",
      description: "Install the Skorvia CLI plugin to research keywords and audit domains straight from your terminal.",
      href: "/docs/claude-code-plugin",
      icon: Terminal,
      badge: "CLI",
    },
    {
      title: "Cursor & IDE Integration",
      description: "Enable inline SEO intelligence inside your IDE when generating copy or technical meta tags.",
      href: "/docs/codex-plugin",
      icon: Code2,
      badge: "Extension",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Documentation & Guides
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              {BRAND_CONFIG.name} Documentation
            </h1>
            <p className="text-base sm:text-lg text-base-content/70">
              Everything you need to integrate MCP tools, run autonomous agent skills, and deploy your custom SEO data pipelines.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {docCategories.map((doc, idx) => {
              const Icon = doc.icon;
              return (
                <Link
                  key={idx}
                  to={doc.href}
                  className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-base-200 px-2.5 py-0.5 text-[11px] font-bold text-base-content/70">
                        {doc.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-base-content group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-base-content/70 mt-1.5 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center text-xs font-bold text-primary">
                    View Guide <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
