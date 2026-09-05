import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
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
      description:
        "Connect Skorvia directly to Claude Code, Cursor, Windsurf, and custom AI agents to query your live SEO data.",
      href: "/docs/mcp",
      icon: "solar:chat-round-dots-bold-duotone",
      badge: "AI Native",
    },
    {
      title: "SEO Agent Skills",
      description:
        "Pre-built autonomous prompt & tool workflows for audits, keyword clustering, and link outreach.",
      href: "/docs/skills",
      icon: "solar:magic-stick-3-bold-duotone",
      badge: "10 Workflows",
    },
    {
      title: "Claude Code Plugin",
      description:
        "Install the Skorvia CLI plugin to research keywords and audit domains straight from your terminal.",
      href: "/docs/claude-code-plugin",
      icon: "solar:code-square-bold-duotone",
      badge: "CLI Tool",
    },
    {
      title: "Cursor & IDE Integration",
      description:
        "Enable inline SEO intelligence inside your IDE when generating copy or technical meta tags.",
      href: "/docs/codex-plugin",
      icon: "solar:laptop-minimalistic-bold-duotone",
      badge: "IDE Ready",
    },
  ];

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="badge badge-cyan">Documentation & Guides</span>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              {BRAND_CONFIG.name} Documentation
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70 max-w-2xl mx-auto">
              Everything you need to integrate MCP tools, run autonomous agent
              skills, and deploy your custom SEO data pipelines.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {docCategories.map((doc, idx) => {
              return (
                <Link
                  key={idx}
                  to={doc.href}
                  className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[101%] flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon
                          icon={doc.icon}
                          className="size-6 text-primary-500"
                        />
                      </div>
                      <span className="badge badge-yellow text-[11px]">
                        {doc.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-heading-5 font-bold font-interTight text-secondary dark:text-accent group-hover:text-primary-500 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 mt-2 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center text-tagline-3 font-bold text-primary-500">
                    <span>View Guide</span>
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="size-4 ml-1.5 transition-transform group-hover:translate-x-1"
                    />
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
