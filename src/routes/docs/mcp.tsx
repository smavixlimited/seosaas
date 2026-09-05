import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";
import { Markdown } from "@/client/components/Markdown";
import { getDocByPath } from "@/lib/content";

export const Route = createFileRoute("/docs/mcp")({
  component: McpDocPage,
});

function McpDocPage() {
  const doc = getDocByPath("mcp");
  const [copied, setCopied] = React.useState(false);

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        skorvia: {
          url: "https://skorvia.com/mcp",
          headers: {
            Authorization: "Bearer <YOUR_SKORVIA_API_KEY>",
          },
        },
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    void navigator.clipboard.writeText(claudeConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background-2 dark:bg-background-8 text-secondary dark:text-accent font-sans selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="pt-[140px] sm:pt-[170px] pb-16 sm:pb-24">
        <div className="main-container max-w-4xl space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-tagline-3 font-semibold text-primary-500">
              <Link to="/docs" className="hover:underline">
                Docs
              </Link>
              <span className="text-secondary/30 dark:text-accent/30">/</span>
              <span className="text-secondary/60 dark:text-accent/60">Model Context Protocol</span>
            </div>
            <h1 className="text-heading-2 font-bold text-secondary dark:text-accent font-interTight">
              Connect {BRAND_CONFIG.name} MCP to AI Clients
            </h1>
            <p className="text-tagline-1 text-secondary/70 dark:text-accent/70">
              Query live keyword difficulty, SERP rankings, backlink velocity, and site audits directly from Claude Code, Cursor, and custom agent workflows.
            </p>
          </div>

          {/* Configuration Snippet */}
          <div className="rounded-[20px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-tagline-3 font-mono font-bold text-secondary/70 dark:text-accent/70">
                claude_desktop_config.json / .cursor/mcp.json
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm btn-outline rounded-full text-xs font-bold gap-1.5"
              >
                {copied ? (
                  <>
                    <Icon icon="solar:check-circle-bold" className="size-4 text-ns-green" />
                    Copied
                  </>
                ) : (
                  <>
                    <Icon icon="solar:copy-linear" className="size-4" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-[14px] bg-secondary dark:bg-background-8 text-white p-5 text-xs font-mono border border-stroke-4 dark:border-stroke-8">
              <code>{claudeConfig}</code>
            </pre>
          </div>

          {/* Render Full Markdown Guide */}
          {doc && (
            <div className="rounded-[24px] border border-stroke-4 dark:border-stroke-8 bg-background-1 dark:bg-background-6 p-6 sm:p-10 shadow-xs prose prose-lg dark:prose-invert max-w-none">
              <Markdown>{doc.content}</Markdown>
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
